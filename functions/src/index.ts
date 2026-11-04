import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();
const db = getFirestore();
const ACTIVE = new Set(["hold", "pendiente_de_aprobacion", "confirmada", "en_curso"]);

type AppointmentInput = { negocioId: string; clienteId: string; empleadoId?: string; servicioId: string; inicio: string; duracionMin: number; modoNegocio: "unipersonal" | "multiEmpleado"; notas?: string; serviceName?: string; servicePrice?: number };
type AvailabilityRule = { start?: string; end?: string; inicio?: string; fin?: string; disponible?: boolean };

function roleOf(data: FirebaseFirestore.DocumentData | undefined) { const role = String(data?.role ?? data?.rol ?? "cliente").toLowerCase(); return role === "admin" || role === "administrador" ? "administrador" : role === "empleado" || role === "employee" ? "empleado" : "cliente"; }
async function profile(uid: string) { return (await db.collection("users").doc(uid).get()).data(); }
async function requireAdmin(uid?: string) { if (!uid || roleOf(await profile(uid)) !== "administrador") throw new HttpsError("permission-denied", "Solo un administrador puede realizar esta acción."); }
function minutesOf(value: string) { const [hour, minute] = value.split(":").map(Number); return hour * 60 + minute; }
function isWithinAvailability(date: Date, durationMin: number, rule?: AvailabilityRule) {
  if (!rule || rule.disponible === false) return false;
  const start = rule.start ?? rule.inicio; const end = rule.end ?? rule.fin;
  if (!start || !end) return true;
  const current = date.getHours() * 60 + date.getMinutes(); const finish = current + durationMin; const from = minutesOf(start); const to = minutesOf(end);
  return to >= from ? current >= from && finish <= to : (current >= from || finish <= to + 24 * 60);
}
function dayRule(availability: Record<string, AvailabilityRule> | undefined, date: Date) { if (!availability) return undefined; const names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]; return availability[String(date.getDay())] ?? availability[names[date.getDay()]]; }
function notify(destinatarioId: string, titulo: string, cuerpo: string) { return db.collection("notificaciones").add({ destinatarioId, titulo, cuerpo, createdAt: Timestamp.now(), leida: false }); }

export const reservarCita = onCall<AppointmentInput>(async request => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const data = request.data;
  if (!data?.negocioId || data.clienteId !== request.auth.uid || !data.servicioId || !data.inicio || data.duracionMin <= 0) throw new HttpsError("invalid-argument", "Datos de cita incompletos.");
  const inicioDate = new Date(data.inicio); if (Number.isNaN(inicioDate.getTime())) throw new HttpsError("invalid-argument", "La hora no es válida.");
  const inicio = Timestamp.fromDate(inicioDate); const finMs = inicio.toMillis() + data.duracionMin * 60_000; const scopeId = data.modoNegocio === "unipersonal" ? data.negocioId : data.empleadoId;
  if (!scopeId) throw new HttpsError("invalid-argument", "Falta empleado.");
  if (data.empleadoId) { const employee = await db.collection("users").doc(data.empleadoId).get(); if (!employee.exists || roleOf(employee.data()) !== "empleado") throw new HttpsError("failed-precondition", "El empleado no está disponible."); const rule = dayRule((employee.data()?.availability ?? employee.data()?.horarios) as Record<string, AvailabilityRule> | undefined, inicioDate); if (rule && !isWithinAvailability(inicioDate, data.duracionMin, rule)) throw new HttpsError("failed-precondition", "El horario queda fuera de la disponibilidad del empleado."); }
  const ref = db.collection("citas").doc();
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(db.collection("citas").where(data.modoNegocio === "unipersonal" ? "negocioId" : "empleadoId", "==", scopeId).where("inicio", ">=", Timestamp.fromMillis(inicio.toMillis() - 24 * 60 * 60_000)).where("inicio", "<=", Timestamp.fromMillis(finMs + 24 * 60 * 60_000)));
    const conflict = snapshot.docs.some(item => { const appointment = item.data(); return ACTIVE.has(appointment.estado) && inicio.toMillis() < appointment.fin.toMillis() && finMs > appointment.inicio.toMillis(); });
    if (conflict) throw new HttpsError("already-exists", "La franja ya no está disponible.");
    const estado = data.modoNegocio === "unipersonal" ? "confirmada" : "pendiente_de_aprobacion";
    tx.set(ref, { ...data, inicio, fin: Timestamp.fromMillis(finMs), estado, createdAt: Timestamp.now() });
  });
  if (data.empleadoId) await notify(data.empleadoId, "Nueva solicitud de cita", `Tienes una solicitud para ${data.serviceName ?? "un servicio"}.`);
  return { citaId: ref.id };
});

export const aprobarCita = onCall<{ citaId: string }>(async request => { if (!request.auth) throw new HttpsError("unauthenticated", "Sesión requerida."); const ref = db.collection("citas").doc(request.data.citaId); const snap = await ref.get(); if (!snap.exists || (snap.data()?.empleadoId !== request.auth.uid && roleOf(await profile(request.auth.uid)) !== "administrador")) throw new HttpsError("permission-denied", "No puedes aprobar esta cita."); await ref.update({ estado: "confirmada", aprobadaPor: request.auth.uid, approvedAt: Timestamp.now() }); if (snap.data()?.clienteId) await notify(snap.data()!.clienteId, "Cita confirmada", "Tu cita fue confirmada por el empleado."); return { ok: true }; });
export const rechazarCita = onCall<{ citaId: string; notas?: string }>(async request => { if (!request.auth) throw new HttpsError("unauthenticated", "Sesión requerida."); const ref = db.collection("citas").doc(request.data.citaId); const snap = await ref.get(); if (!snap.exists || (snap.data()?.empleadoId !== request.auth.uid && roleOf(await profile(request.auth.uid)) !== "administrador")) throw new HttpsError("permission-denied", "No puedes rechazar esta cita."); await ref.update({ estado: "rechazada", notas: request.data.notas ?? "", rejectedAt: Timestamp.now() }); if (snap.data()?.clienteId) await notify(snap.data()!.clienteId, "Cita rechazada", request.data.notas ?? "El empleado no pudo aceptar ese horario."); return { ok: true }; });
export const iniciarServicio = onCall<{ citaId: string }>(async request => { if (!request.auth) throw new HttpsError("unauthenticated", "Sesión requerida."); const ref = db.collection("citas").doc(request.data.citaId); const snap = await ref.get(); if (!snap.exists || snap.data()?.empleadoId !== request.auth.uid) throw new HttpsError("permission-denied", "Solo el empleado asignado puede iniciar el servicio."); await ref.update({ estado: "en_curso", startedAt: Timestamp.now() }); return { ok: true }; });
export const finalizarServicio = onCall<{ citaId: string }>(async request => { if (!request.auth) throw new HttpsError("unauthenticated", "Sesión requerida."); const ref = db.collection("citas").doc(request.data.citaId); const snap = await ref.get(); if (!snap.exists || snap.data()?.empleadoId !== request.auth.uid) throw new HttpsError("permission-denied", "Solo el empleado asignado puede finalizar el servicio."); const now = Timestamp.now(); const startedAt = snap.data()?.startedAt as Timestamp | undefined; const real = startedAt ? Math.max(0, Math.round((now.toMillis() - startedAt.toMillis()) / 60_000)) : null; await ref.update({ estado: "completada", completedAt: now, duracionRealMin: real }); return { ok: true, duracionRealMin: real }; });
export const promoverEmpleado = onCall<{ uid: string; name?: string; email?: string; profileImage?: string }>(async request => { await requireAdmin(request.auth?.uid); if (!request.data?.uid) throw new HttpsError("invalid-argument", "Falta uid."); await db.collection("users").doc(request.data.uid).set({ ...request.data, id: request.data.uid, role: "empleado", promotedAt: Timestamp.now(), availability: { lunes: { start: "08:00", end: "17:00", disponible: true }, martes: { start: "08:00", end: "17:00", disponible: true }, miércoles: { start: "08:00", end: "17:00", disponible: true }, jueves: { start: "08:00", end: "17:00", disponible: true }, viernes: { start: "08:00", end: "17:00", disponible: true } } }, { merge: true }); return { ok: true }; });
export const expirarHolds = onSchedule("every 10 minutes", async () => { const now = Timestamp.now(); const snapshot = await db.collection("citas").where("estado", "==", "hold").where("holdExpiresAt", "<", now).get(); const batch = db.batch(); snapshot.docs.forEach(item => batch.update(item.ref, { estado: "expirada", expiredAt: now })); await batch.commit(); });
export const enviarPush = onCall<{ destinatarioId: string; titulo: string; cuerpo: string }>(async request => { if (!request.auth) throw new HttpsError("unauthenticated", "Sesión requerida."); await notify(request.data.destinatarioId, request.data.titulo, request.data.cuerpo); return { queued: true }; });
