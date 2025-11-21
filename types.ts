export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface OperationData {
  id: string;
  flightNumber: string;
  status: 'On Time' | 'Delayed' | 'Boarding' | 'Arrived' | 'Cancelled';
  destination: string;
  gate: string;
  time: string;
  passengerCount: number;
}

export interface Contract {
  id: string;
  provider_name: string;
  service_concept: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  amount_mxn: number;
  status: 'ACTIVO' | 'POR VENCER' | 'VENCIDO' | 'CANCELADO';
  area: string;
}

export interface CommercialSpace {
  id: string;
  space_code: string;
  tenant_name: string | null;
  category: string;
  monthly_rent: number;
  occupancy_status: 'OCUPADO' | 'DISPONIBLE' | 'MANTENIMIENTO';
}

// Interfaz exacta basada en tu tabla de Supabase "balance_paas_2026"
export interface PaasItem {
  id: number; // bigint en SQL suele leerse como number en JS (o string si es muy grande)
  "No.": string | null;
  "Clave cucop": string | null;
  "Nombre del Servicio.": string | null; // Nota el punto al final como en tu SQL
  "Subdirección": string | null;
  "Gerencia": string | null;
  "Monto solicitado anteproyecto 2026": number | null;
  "Modificado": number | null;
  "Justificación": string | null;
}

export enum Screen {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD'
}

export interface KPIData {
  label: string;
  value: string;
  trend: number; // Percentage change
  icon: string; // Lucide icon name
}