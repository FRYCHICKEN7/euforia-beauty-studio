import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();
const db = getFirestore();
const ACTIVE = new Set(["hold", "pendiente_de_aprobacion", "confirmada", "en_curso"]);

type AppointmentInput = { negocioId: string; clienteId: string; empleadoId?: string; servicioId: string; inicio: string; duracionMin: number; modoNegocio: "unipersonal" | "multiEmpleado"; notas?: string };

export const reservarCita = onCall<AppointmentInput>(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const data = request.data;
  if (!data?.negocioId || !data.clienteId || !data.servicioId || !data.inicio || data.duracionMin <= 0) throw new HttpsError("invalid-argument", "Datos de cita incompletos.");
  const inicio = Timestamp.fromDate(new Date(data.inicio));
  const finMs = inicio.toMillis() + data.duracionMin * 60_000;
  const scopeId = data.modoNegocio === "unipersonal" ? data.negocioId : data.empleadoId;
  if (!scopeId) throw new HttpsError("invalid-argument", "Falta empleado.");
  const ref = db.collection("citas").doc();
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(db.collection("citas").where(data.modoNegocio === "unipersonal" ? "negocioId" : "empleadoId", "==", scopeId).where("inicio", ">=", Timestamp.fromMillis(inicio.toMillis() - 24 * 60 * 60_000)).where("inicio", "<=", Timestamp.fromMillis(finMs)));
    const conflict = snapshot.docs.some(doc => { const item = doc.data(); return ACTIVE.has(item.estado) && inicio.toMillis() < item.fin.toMillis() && finMs > item.inicio.toMillis(); });
    if (conflict) throw new HttpsError("already-exists", "La franja ya no está disponible.");
    tx.set(ref, { ...data, inicio, fin: Timestamp.fromMillis(finMs), estado: data.modoNegocio === "unipersonal" ? "confirmada" : "pendiente_de_aprobacion", createdAt: Timestamp.now() });
  });
  return { citaId: ref.id };
});

export const aprobarCita = onCall<{ citaId: string }>(async request => { if (!request.auth) throw new HttpsError("unauthenticated", "Sesión requerida."); await db.collection("citas").doc(request.data.citaId).update({ estado: "confirmada", aprobadaPor: request.auth.uid, approvedAt: Timestamp.now() }); return { ok: true }; });
export const rechazarCita = onCall<{ citaId: string; notas?: string }>(async request => { if (!request.auth) throw new HttpsError("unauthenticated", "Sesión requerida."); await db.collection("citas").doc(request.data.citaId).update({ estado: "rechazada", notas: request.data.notas ?? "" }); return { ok: true }; });
export const expirarHolds = onSchedule("every 10 minutes", async () => { const now = Timestamp.now(); const snapshot = await db.collection("citas").where("estado", "==", "hold").where("holdExpiresAt", "<", now).get(); const batch = db.batch(); snapshot.docs.forEach(doc => batch.update(doc.ref, { estado: "expirada", expiredAt: now })); await batch.commit(); });
export const enviarPush = onCall<{ destinatarioId: string; titulo: string; cuerpo: string }>(async request => { if (!request.auth) throw new HttpsError("unauthenticated", "Sesión requerida."); await db.collection("notificaciones").add({ ...request.data, createdAt: Timestamp.now(), leida: false }); return { queued: true }; });
