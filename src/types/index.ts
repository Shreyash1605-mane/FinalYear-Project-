export interface VitalMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'warning' | 'critical';
  color: string;
  bgLight: string;
  history: number[];
}

export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  id: string;
  bloodGroup: string;
  allergies: string;
  photoUrl: string;
  dob?: string;
  weightKg?: number;
  heightCm?: number;
  triageLevel?: 'Level 1 - Immediate' | 'Level 2 - Emergency' | 'Level 3 - Urgent';
  primaryDiagnosis?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceId?: string;
  address?: string;
}

export interface AmbulanceLocation {
  ambulanceId: string;
  status: string;
  distanceKm: number;
  etaMins: number;
  speedKmh: number;
  lat: number;
  lng: number;
  hospitalLat: number;
  hospitalLng: number;
  driverName?: string;
  paramedicName?: string;
  sirenActive?: boolean;
}

export interface AmbulanceTelemetry {
  ambulanceId: string;
  timestamp: number;
  heartRate: number;
  spo2: number;
  bloodPressure: string;
  respiratoryRate: number;
  temperature: number;
  ecgWaveform: number[];
  cameraStreamUrl?: string;
  intercomChannelId?: string;
  connectionStatus: 'online' | 'offline';
}

export interface Treatment {
  id: string;
  time: string;
  description: string;
  completed: boolean;
  category?: 'Respiratory' | 'Cardiovascular' | 'IV/Medication' | 'Trauma';
  performedBy?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  route?: string;
  timeAdministered?: string;
  status?: 'Given' | 'Pending' | 'Ordered';
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  acknowledged?: boolean;
  parameter?: string;
}

export interface EcgLeadData {
  leadName: string;
  status: 'Connected' | 'Calibrating' | 'Disconnect';
  stSegmentVal: string;
  qtInterval: string;
}

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'ECG Monitor' | 'Defibrillator' | 'Pulse Oximeter' | 'GPS Tracker' | '5G Telemetry Gateway';
  status: 'Connected' | 'Standby' | 'Disconnected';
  battery: number;
  signalStrength: number;
}

export interface DoctorUser {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  avatarUrl: string;
  hospitalName?: string;
}

export type ViewTab =
  | 'dashboard'
  | 'patient'
  | 'vitals'
  | 'ecg'
  | 'treatments'
  | 'medications'
  | 'alerts'
  | 'tracking'
  | 'reports'
  | 'settings'
  | 'login';
