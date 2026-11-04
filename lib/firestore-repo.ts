import { collection, doc, onSnapshot, query, where, type DocumentData, type Firestore, type QueryConstraint } from "firebase/firestore";

export type UserRole = "cliente" | "customer" | "empleado" | "employee" | "administrador" | "admin";
export type UserProfile = { id: string; email?: string; identityNumber?: string; name?: string; phone?: string; profileImage?: string; role?: UserRole; availability?: Record<string, { start?: string; end?: string; inicio?: string; fin?: string; disponible: boolean }> };
export type Service = { id: string; name: string; nombre?: string; price?: number; precio?: number; durationMin?: number; duracionMin?: number; active?: boolean; activo?: boolean };
export type Appointment = { id: string; clienteId: string; empleadoId?: string; servicioId: string; inicio?: { seconds: number } | Date; fin?: { seconds: number } | Date; estado: string; serviceName?: string; servicePrice?: number; startedAt?: { seconds: number }; completedAt?: { seconds: number }; duracionRealMin?: number };

export function normalizedRole(value?: string): "cliente" | "empleado" | "administrador" {
  const role = (value ?? "cliente").toLowerCase();
  if (role === "admin" || role === "administrador") return "administrador";
  if (role === "employee" || role === "empleado") return "empleado";
  return "cliente";
}

export function subscribeUsers(db: Firestore, role: UserRole | UserRole[], onData: (items: UserProfile[]) => void, onError?: (error: Error) => void) {
  const roles = Array.isArray(role) ? role : [role];
  const constraints: QueryConstraint[] = roles.length === 1 ? [where("role", "==", roles[0])] : [where("role", "in", roles)];
  return onSnapshot(query(collection(db, "users"), ...constraints), snapshot => onData(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as UserProfile))), error => onError?.(error as Error));
}

export function subscribeEmployees(db: Firestore, onData: (items: UserProfile[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(collection(db, "empleados"), snapshot => onData(snapshot.docs.map(item => ({ id: item.id, ...item.data(), role: "empleado" } as UserProfile))), error => onError?.(error as Error));
}

export function subscribeAllUsers(db: Firestore, onData: (items: UserProfile[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(collection(db, "users"), snapshot => onData(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as UserProfile))), error => onError?.(error as Error));
}

export function subscribeServices(db: Firestore, onData: (items: Service[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(collection(db, "servicios"), snapshot => onData(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Service))), error => onError?.(error as Error));
}

export function subscribeAppointments(db: Firestore, constraints: QueryConstraint[], onData: (items: Appointment[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(query(collection(db, "citas"), ...constraints), snapshot => onData(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Appointment))), error => onError?.(error as Error));
}

export function userRef(db: Firestore, uid: string) { return doc(db, "users", uid); }
export function collectionRef(db: Firestore, name: string) { return collection(db, name); }

export function timestampMillis(value: Appointment["inicio"]): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  return typeof value === "object" && "seconds" in value ? value.seconds * 1000 : 0;
}

export function serviceDuration(service: Service): number { return service.durationMin ?? service.duracionMin ?? 30; }
export function servicePrice(service: Service): number { return service.price ?? service.precio ?? 0; }
export function serviceName(service: Service): string { return service.name ?? service.nombre ?? "Servicio"; }

export function matchesSearch(item: DocumentData, value: string) {
  const needle = value.trim().toLowerCase();
  if (!needle) return true;
  return [item.name, item.email, item.phone, item.identityNumber].filter(Boolean).some(field => String(field).toLowerCase().includes(needle));
}
