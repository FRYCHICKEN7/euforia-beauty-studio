export type Client = {
  id: string;
  initials: string;
  name: string;
  phone: string;
  service: string;
  lastVisit: string;
  nextVisit?: string;
  daysSince: number;
  returnIn: number;
  avatarColor: string;
};

export type Service = { id: string; name: string; duration: string; price: number; category: string };

export const demoClients: Client[] = [
  { id: "1", initials: "MR", name: "María Rodríguez", phone: "+504 9988-2211", service: "Balayage + hidratación", lastVisit: "18 oct 2026", daysSince: 14, returnIn: 2, avatarColor: "#E7A4B4" },
  { id: "2", initials: "CP", name: "Carla Pineda", phone: "+504 9771-4032", service: "Manicure gel", lastVisit: "14 oct 2026", daysSince: 18, returnIn: 0, avatarColor: "#D7B28D" },
  { id: "3", initials: "AS", name: "Ana Sofía", phone: "+504 9455-8021", service: "Corte y brushing", lastVisit: "04 oct 2026", daysSince: 28, returnIn: -3, avatarColor: "#B9A6D8" },
  { id: "4", initials: "LM", name: "Laura Méndez", phone: "+504 9866-1190", service: "Limpieza facial", lastVisit: "29 sep 2026", daysSince: 33, returnIn: -8, avatarColor: "#9FC8B5" },
];

export const demoServices: Service[] = [
  { id: "1", name: "Balayage + hidratación", duration: "2 h 30 min", price: 1850, category: "Cabello" },
  { id: "2", name: "Manicure gel", duration: "1 h", price: 450, category: "Uñas" },
  { id: "3", name: "Corte y brushing", duration: "1 h 15 min", price: 650, category: "Cabello" },
  { id: "4", name: "Limpieza facial", duration: "1 h 20 min", price: 750, category: "Facial" },
];

export const summary = { income: 24850, visits: 42, popular: "Manicure gel", toRemind: 8 };
