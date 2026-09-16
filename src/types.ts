export type TabType = 
  | 'dashboard' 
  | 'units' 
  | 'incidents' 
  | 'meetings' 
  | 'reservations' 
  | 'finances' 
  | 'notices' 
  | 'github';

export interface Community {
  id: string;
  name: string;
  cif: string;
  address: string;
  postalCode: string;
  city: string;
  totalUnits: number;
  presidentName: string;
  presidentUnit: string;
  administratorName: string;
  administratorPhone: string;
  currentYearBudget: number;
  reserveFund: number;
  totalBalance: number;
  bankAccount: string;
}

export type UnitStatus = 'al_dia' | 'pendiente' | 'moroso';

export interface Unit {
  id: string;
  floorDoor: string; // e.g., "1º A"
  staircase?: string; // e.g., "Escalera Izquierda"
  coefficient: number; // e.g. 5.50 (%)
  monthlyFee: number; // Monthly quota in EUR
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  tenantName?: string;
  tenantPhone?: string;
  status: UnitStatus;
  debtAmount: number; // Amount owed in EUR
  iban?: string;
  notes?: string;
}

export type IncidentCategory = 
  | 'ascensor' 
  | 'fontaneria' 
  | 'electricidad' 
  | 'limpieza' 
  | 'seguridad' 
  | 'jardineria' 
  | 'antena_telecom' 
  | 'fachada_tejados' 
  | 'zonas_comunes';

export type IncidentPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type IncidentStatus = 'registrada' | 'en_curso' | 'resuelta' | 'cancelada';

export interface IncidentComment {
  id: string;
  author: string;
  role: 'vecino' | 'presidente' | 'administrador' | 'tecnico';
  content: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  unitReporter: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost?: number;
  finalCost?: number;
  assignedTechnician?: string;
  githubIssueNumber?: number;
  githubIssueUrl?: string;
  comments: IncidentComment[];
}

export type MeetingType = 'ordinaria' | 'extraordinaria';
export type MeetingStatus = 'convocada' | 'en_curso' | 'finalizada';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  budgetEstimated?: number;
  votesInFavor: number;
  votesAgainst: number;
  abstentions: number;
  userVoted?: 'favor' | 'contra' | 'abstencion';
}

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  date: string;
  time: string;
  location: string;
  agenda: string[];
  proposals: Proposal[];
  minutesMarkdown?: string;
  syncedToGitHub?: boolean;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  icon: string;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  maxReservationsPerUnitWeek: number;
  requiresKey: boolean;
}

export interface Reservation {
  id: string;
  facilityId: string;
  facilityName: string;
  unitId: string;
  unitName: string;
  reserverName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 - 11:30"
  createdAt: string;
}

export type TransactionType = 'ingreso' | 'gasto';

export interface Transaction {
  id: string;
  date: string;
  concept: string;
  type: TransactionType;
  category: string;
  amount: number;
  unitId?: string;
  status: 'pagado' | 'pendiente' | 'domiciliado';
  invoiceNumber?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  role: string;
  priority: 'normal' | 'importante' | 'urgente';
  pinned?: boolean;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  email?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description?: string;
  default_branch: string;
  updated_at: string;
}

export interface GitHubState {
  isConnected: boolean;
  authMethod: 'oauth' | 'pat' | null;
  token: string | null;
  user: GitHubUser | null;
  selectedRepo: GitHubRepo | null;
  lastSyncDate: string | null;
  lastCommitSha: string | null;
  lastSyncUrl: string | null;
  syncHistory: Array<{
    id: string;
    date: string;
    type: 'full_backup' | 'incidents_sync' | 'minutes_backup';
    repo: string;
    commitSha?: string;
    details: string;
  }>;
}
