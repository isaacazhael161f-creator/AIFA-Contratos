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