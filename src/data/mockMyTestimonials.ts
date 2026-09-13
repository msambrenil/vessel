import { EncounterTestimonial } from "@/types/vessel";

export const MOCK_MY_RECEIVED_TESTIMONIALS: EncounterTestimonial[] = [
  {
    id: "received-test-01",
    authorId: "vessel-01",
    authorCodename: "KLAUS_030",
    authorAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    content:
      "Increíble anfitrión, lugar súper prolijo y respeto absoluto de los acuerdos previos. Cero vueltas, química del 100% y excelente comunicación. Repetimos seguro.",
    tags: ["Excelente Host", "Química Total", "Puntual", "Respeto de Límites"],
    createdAt: "Hace 2 días",
    rating: 5,
    karmaAwarded: 10,
    validationMethod: "geofencing",
    status: "approved",
    encounterVerified: true,
  },
  {
    id: "received-test-02",
    authorId: "vessel-02",
    authorCodename: "RECEPTOR_V",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    content:
      "Muy buena onda y súper atento desde el primer mensaje. Cumplió con todo lo pactado en el chat efímero. Vibra impecable y trato de diez.",
    tags: ["Buena Vibra", "Puntual", "Trato Impecable"],
    createdAt: "Hace 5 días",
    rating: 5,
    karmaAwarded: 5,
    validationMethod: "rendezvous_pin",
    status: "approved",
    encounterVerified: true,
  },
  {
    id: "received-test-03",
    authorId: "vessel-03",
    authorCodename: "VOID_MONOLITH",
    authorAvatar:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    content:
      "Presencia física imponente y energía carnal directa. Coordinación rápida sin rodeos ni pérdidas de tiempo. Totalmente recomendado.",
    tags: ["Intensidad Pura", "Directo", "100% Recomendado"],
    createdAt: "Hace 2 semanas",
    rating: 5,
    karmaAwarded: 5,
    validationMethod: "geofencing",
    status: "approved",
    encounterVerified: true,
  },
];
