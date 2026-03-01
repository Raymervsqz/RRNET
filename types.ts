
export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  CUT = 'CUT',
  SUSPENDED = 'SUSPENDED'
}

export enum InvoiceStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export type ZoneType = 'R&RNETWORK' | 'RV NETWORK' | 'RB NETWORK';

export interface Plan {
  id: string;
  name: string;
  speed: string;
  price: number;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  planId: string;
  pppoeUser: string;
  addressList: string;
  status: ClientStatus;
  createdAt: string;
  terminalId?: string;
  portNumber?: number;
  zone: ZoneType;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface FixedExpense {
  id: string;
  label: string;
  amount: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  period: string;
  paidAt?: string;
}

export interface RouterConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  status: 'ONLINE' | 'OFFLINE';
}

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
}

export interface Terminal {
  id: string;
  name: string;
  lat: number;
  lng: number;
  ponSource: string;
  totalPorts: number;
  color?: string;
}

export interface Cable {
  id: string;
  name: string;
  type: 'TRUNK' | 'DISTRIBUTION' | 'DROP';
  points: [number, number][]; 
  color: string;
}
