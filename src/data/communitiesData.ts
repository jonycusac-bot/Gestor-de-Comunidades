export interface OwnerModel {
  id?: string;
  initials: string;
  name: string;
  home: string;
  email: string;
  phone?: string;
  coefficient?: string;
  payment: "Al día" | "Pendiente";
  dni?: string;
}

export interface CommunityModel {
  id: string;
  name: string;
  slug: string;
  location: string;
  cif: string;
  portals: number;
  totalUnits: number;
  totalOwners: number;
  openCommunications: number;
  pendingPaymentsCount: number;
  pendingPaymentsPercent: string;
  totalDocuments: number;
  newDocumentsMonth: number;
  gradient: string;
  avatarBg: string;
  avatarInitials: string;
  communications: Array<{
    type: "Incidencia" | "Consulta" | "Sugerencia" | "Queja";
    title: string;
    meta: string;
    person: string;
    time: string;
    tone: "red" | "blue" | "violet" | "amber";
  }>;
  owners: OwnerModel[];
  documents: Array<{
    title: string;
    category: string;
    date: string;
    files: string;
    status: "Publicado" | "Borrador";
  }>;
  events: Array<{
    day: string;
    month: string;
    title: string;
    time: string;
    location?: string;
    status: string;
    statusClass?: string;
    pale?: boolean;
  }>;
  attentionItems: Array<{
    icon: "alert" | "wallet" | "check";
    tone: "red" | "amber" | "blue";
    title: string;
    subtitle: string;
  }>;
}

export const initialCommunitiesList: CommunityModel[] = [
  {
    id: "bel-air",
    name: "Terrazas de Bel Air",
    slug: "terrazas-bel-air",
    location: "Estepona, Málaga",
    cif: "H-92817264",
    portals: 4,
    totalUnits: 86,
    totalOwners: 82,
    openCommunications: 4,
    pendingPaymentsCount: 7,
    pendingPaymentsPercent: "8,1%",
    totalDocuments: 124,
    newDocumentsMonth: 6,
    gradient: "linear-gradient(135deg, #194a38, #2d7558)",
    avatarBg: "#257454",
    avatarInitials: "TB",
    communications: [
      {
        type: "Incidencia",
        title: "Fuga de agua en garaje",
        meta: "Portal 2 · Bajo A",
        person: "María González",
        time: "Hace 25 min",
        tone: "red",
      },
      {
        type: "Consulta",
        title: "Horario de la piscina",
        meta: "Portal 4 · 2º B",
        person: "Carlos Romero",
        time: "Hace 2 h",
        tone: "blue",
      },
      {
        type: "Sugerencia",
        title: "Iluminación zona ajardinada",
        meta: "Portal 1 · 1º C",
        person: "Elena Ruiz",
        time: "Ayer",
        tone: "violet",
      },
      {
        type: "Queja",
        title: "Ruido durante la madrugada",
        meta: "Portal 3 · Ático A",
        person: "Antonio Martín",
        time: "Ayer",
        tone: "amber",
      },
    ],
    owners: [
      {
        initials: "MG",
        name: "María González",
        home: "Portal 2 · Bajo A",
        email: "maria.gonzalez@demo.es",
        payment: "Al día",
      },
      {
        initials: "CR",
        name: "Carlos Romero",
        home: "Portal 4 · 2º B",
        email: "carlos.romero@demo.es",
        payment: "Al día",
      },
      {
        initials: "ER",
        name: "Elena Ruiz",
        home: "Portal 1 · 1º C",
        email: "elena.ruiz@demo.es",
        payment: "Pendiente",
      },
      {
        initials: "AM",
        name: "Antonio Martín",
        home: "Portal 3 · Ático A",
        email: "antonio.martin@demo.es",
        payment: "Al día",
      },
      {
        initials: "LS",
        name: "Lucía Sánchez",
        home: "Portal 4 · 3º A",
        email: "lucia.sanchez@demo.es",
        payment: "Pendiente",
      },
    ],
    documents: [
      {
        title: "Convocatoria Junta General Ordinaria",
        category: "Convocatorias",
        date: "12/09/2026",
        files: "2 archivos",
        status: "Publicado",
      },
      {
        title: "Presupuesto reparación de fachada",
        category: "Presupuestos",
        date: "08/09/2026",
        files: "3 archivos",
        status: "Publicado",
      },
      {
        title: "Informe técnico de ascensores",
        category: "Informes técnicos",
        date: "02/09/2026",
        files: "1 archivo",
        status: "Borrador",
      },
      {
        title: "Acta Junta Extraordinaria",
        category: "Actas",
        date: "17/08/2026",
        files: "1 archivo",
        status: "Publicado",
      },
    ],
    events: [
      {
        day: "24",
        month: "SEP",
        title: "Junta General Ordinaria",
        time: "18:30 · Salón comunitario",
        status: "Convocada",
      },
      {
        day: "02",
        month: "OCT",
        title: "Revisión sistema contra incendios",
        time: "09:00 · Zonas comunes",
        status: "Mantenimiento",
        statusClass: "neutral",
        pale: true,
      },
    ],
    attentionItems: [
      {
        icon: "alert",
        tone: "red",
        title: "2 incidencias urgentes",
        subtitle: "Requieren una respuesta",
      },
      {
        icon: "wallet",
        tone: "amber",
        title: "7 pagos pendientes",
        subtitle: "Última actualización: hoy",
      },
      {
        icon: "check",
        tone: "blue",
        title: "3 documentos en borrador",
        subtitle: "Pendientes de publicar",
      },
    ],
  },
  {
    id: "jardines-sol",
    name: "Jardines del Sol",
    slug: "jardines-del-sol",
    location: "Marbella, Málaga",
    cif: "H-29148590",
    portals: 3,
    totalUnits: 64,
    totalOwners: 61,
    openCommunications: 3,
    pendingPaymentsCount: 4,
    pendingPaymentsPercent: "6,2%",
    totalDocuments: 98,
    newDocumentsMonth: 4,
    gradient: "linear-gradient(135deg, #9a5316, #d97706)",
    avatarBg: "#d97706",
    avatarInitials: "JS",
    communications: [
      {
        type: "Incidencia",
        title: "Fallo en motor de puerta corredera garaje",
        meta: "Portal 1 · Sótano -1",
        person: "Alejandro Mendoza",
        time: "Hace 18 min",
        tone: "red",
      },
      {
        type: "Consulta",
        title: "Reserva pista de tenis fin de semana",
        meta: "Portal 2 · 3º C",
        person: "Beatriz Soler",
        time: "Hace 1 h",
        tone: "blue",
      },
      {
        type: "Sugerencia",
        title: "Instalación de buzón para paquetería inteligente",
        meta: "Portal 3 · 1º A",
        person: "Gonzalo Pardo",
        time: "Hace 3 h",
        tone: "violet",
      },
      {
        type: "Queja",
        title: "Riego automático por goteo salpica pasarela este",
        meta: "Portal 1 · Zonas ajardinadas",
        person: "Carmen Navarro",
        time: "Ayer",
        tone: "amber",
      },
    ],
    owners: [
      {
        initials: "AM",
        name: "Alejandro Mendoza",
        home: "Portal 1 · 2º A",
        email: "a.mendoza@sol.demo",
        payment: "Al día",
      },
      {
        initials: "BS",
        name: "Beatriz Soler",
        home: "Portal 2 · 3º C",
        email: "b.soler@sol.demo",
        payment: "Al día",
      },
      {
        initials: "GP",
        name: "Gonzalo Pardo",
        home: "Portal 3 · 1º A",
        email: "g.pardo@sol.demo",
        payment: "Pendiente",
      },
      {
        initials: "CN",
        name: "Carmen Navarro",
        home: "Portal 1 · Bajo B",
        email: "carmen.navarro@sol.demo",
        payment: "Al día",
      },
      {
        initials: "JD",
        name: "Javier Delgado",
        home: "Portal 2 · Ático B",
        email: "j.delgado@sol.demo",
        payment: "Pendiente",
      },
    ],
    documents: [
      {
        title: "Convocatoria Junta Extraordinaria Presupuestos",
        category: "Convocatorias",
        date: "14/09/2026",
        files: "1 archivo",
        status: "Publicado",
      },
      {
        title: "Póliza Seguro Multirriesgo Comunitario Allianz",
        category: "Seguros",
        date: "01/09/2026",
        files: "2 archivos",
        status: "Publicado",
      },
      {
        title: "Certificado Eficiencia Energética e ITE",
        category: "Informes técnicos",
        date: "22/08/2026",
        files: "4 archivos",
        status: "Publicado",
      },
      {
        title: "Presupuesto pintura perimetral y verjas",
        category: "Presupuestos",
        date: "10/09/2026",
        files: "2 archivos",
        status: "Borrador",
      },
    ],
    events: [
      {
        day: "28",
        month: "SEP",
        title: "Junta Extraordinaria Presupuestos",
        time: "19:00 · Club social Jardines del Sol",
        status: "Convocada",
      },
      {
        day: "08",
        month: "OCT",
        title: "Poda de palmeras y mantenimiento jardines",
        time: "08:30 · Jardines y viales",
        status: "Mantenimiento",
        statusClass: "neutral",
        pale: true,
      },
    ],
    attentionItems: [
      {
        icon: "alert",
        tone: "red",
        title: "1 incidencia urgente",
        subtitle: "Avisado técnico de motor garaje",
      },
      {
        icon: "wallet",
        tone: "amber",
        title: "4 pagos pendientes",
        subtitle: "6,2% de viviendas",
      },
      {
        icon: "check",
        tone: "blue",
        title: "1 documento en borrador",
        subtitle: "Presupuesto de pintura",
      },
    ],
  },
];
