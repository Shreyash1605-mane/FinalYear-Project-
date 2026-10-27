import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  VitalMetric,
  PatientInfo,
  AmbulanceLocation,
  Treatment,
  Medication,
  AlertItem,
  DoctorUser,
  ViewTab,
} from '../types';
import { rankalaLocation, hospitalLocations } from '../data/hospitalLocations';
import { saveDashboardSnapshot } from '../lib/firestore';

interface AmbulanceContextType {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  vitals: VitalMetric[];
  patient: PatientInfo;
  ambulance: AmbulanceLocation;
  treatments: Treatment[];
  medications: Medication[];
  alerts: AlertItem[];
  doctorNotes: string;
  setDoctorNotes: (notes: string) => void;
  addTreatment: (desc: string) => void;
  addMedication: (name: string, dosage: string) => void;
  showVoiceCallModal: boolean;
  setShowVoiceCallModal: (show: boolean) => void;
  showMessageDrawer: boolean;
  setShowMessageDrawer: (show: boolean) => void;
  showSosModal: boolean;
  setShowSosModal: (show: boolean) => void;
  isAudioMuted: boolean;
  setIsAudioMuted: (muted: boolean) => void;
  showInfoBanner: boolean;
  setShowInfoBanner: (show: boolean) => void;
  databaseStatus: 'idle' | 'syncing' | 'synced' | 'error';
  databaseError: string | null;
  triggerAudioBeep: (type?: 'ecg' | 'sos') => void;
  // Doctor Auth State
  isAuthenticated: boolean;
  currentDoctor: DoctorUser;
  loginDoctor: (email: string, pass: string, department: string) => void;
  logoutDoctor: () => void;
}

// Initial Baseline Vitals converted into ZERO as requested
const initialVitals: VitalMetric[] = [
  {
    id: 'hr',
    name: 'Heart Rate',
    value: 0,
    unit: 'bpm',
    normalRange: '60-100 bpm',
    status: 'normal',
    color: '#22c55e',
    bgLight: 'rgba(34, 197, 94, 0.1)',
    history: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'spo2',
    name: 'SpO2',
    value: 0,
    unit: '%',
    normalRange: '95-100%',
    status: 'normal',
    color: '#38bdf8',
    bgLight: 'rgba(56, 189, 248, 0.1)',
    history: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'bp',
    name: 'Blood Pressure',
    value: '0/0',
    unit: 'mmHg',
    normalRange: '90/60 - 120/80',
    status: 'normal',
    color: '#f97316',
    bgLight: 'rgba(249, 115, 22, 0.1)',
    history: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'rr',
    name: 'Respiratory Rate',
    value: 0,
    unit: 'rpm',
    normalRange: '12-20 rpm',
    status: 'normal',
    color: '#a855f7',
    bgLight: 'rgba(168, 85, 247, 0.1)',
    history: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'temp',
    name: 'Temperature',
    value: '0.0',
    unit: '°C',
    normalRange: '36.1-37.2°C',
    status: 'normal',
    color: '#ef4444',
    bgLight: 'rgba(239, 68, 68, 0.1)',
    history: [0, 0, 0, 0, 0, 0],
  },
];

const initialPatient: PatientInfo = {
  name: 'Rahul Verma',
  dob: '1997-01-01',
  age: 28,
  gender: 'Male',
  id: 'PAT12345',
  bloodGroup: 'B+',
  allergies: 'None',
  photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
};

// Initial Ambulance Telemetry Location converted to zero initial telemetry baseline
const initialAmbulance: AmbulanceLocation = {
  ambulanceId: 'AMB-108',
  status: 'Standby / Telemetry Ready',
  distanceKm: 0.0,
  etaMins: 0,
  speedKmh: 0,
  lat: rankalaLocation.lat,
  lng: rankalaLocation.lng,
  hospitalLat: hospitalLocations[0].lat,
  hospitalLng: hospitalLocations[0].lng,
};

const initialDoctor: DoctorUser = {
  id: 'DOC-88392',
  name: 'Dr. Rahul Sharma',
  title: 'Senior Cardiologist & ER Specialist',
  department: 'Cardiology & Emergency Response',
  email: 'dr.rahul.sharma@hospital.org',
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
  hospitalName: 'St. Jude General Hospital ER',
};

const initialTreatments: Treatment[] = [
  { id: '1', time: '10:15 AM', description: 'Oxygen Therapy Started', completed: true },
  { id: '2', time: '10:18 AM', description: 'IV Fluid Administered', completed: true },
];

const initialMedications: Medication[] = [
  { id: 'm1', name: 'Paracetamol', dosage: '500 mg' },
];

const initialAlerts: AlertItem[] = [
  { id: 'a1', type: 'info', message: 'Telemetry System Standby (Initial Zero State)', time: '10:00 AM' },
];

const AmbulanceContext = createContext<AmbulanceContextType | undefined>(undefined);

export const AmbulanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [vitals] = useState<VitalMetric[]>(initialVitals);
  const [patient] = useState<PatientInfo>(initialPatient);
  const [ambulance] = useState<AmbulanceLocation>(initialAmbulance);
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments);
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [alerts] = useState<AlertItem[]>(initialAlerts);
  const [doctorNotes, setDoctorNotes] = useState<string>(
    'Awaiting continuous telemetry sync. Baseline vitals initialized.'
  );

  // Doctor Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorUser>(initialDoctor);

  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [showMessageDrawer, setShowMessageDrawer] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [databaseStatus, setDatabaseStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  const loginDoctor = (email: string, _pass: string, department: string) => {
    setCurrentDoctor({
      id: 'DOC-' + Math.floor(10000 + Math.random() * 90000),
      name: email.split('@')[0].replace('.', ' ').toUpperCase().padStart(4, 'Dr. '),
      title: 'Attending Specialist',
      department: department || 'Emergency Care',
      email: email,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
      hospitalName: 'St. Jude General Hospital ER',
    });
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const logoutDoctor = () => {
    setIsAuthenticated(false);
    setActiveTab('login');
  };

  const triggerAudioBeep = (type: 'ecg' | 'sos' = 'ecg') => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'sos') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio context safety catch
    }
  };

  const addTreatment = (description: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTr: Treatment = {
      id: Date.now().toString(),
      time: timeStr,
      description,
      completed: true,
    };
    setTreatments((prev) => [newTr, ...prev]);
  };

  const addMedication = (name: string, dosage: string) => {
    const newMed: Medication = {
      id: Date.now().toString(),
      name,
      dosage,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  useEffect(() => {
    setDatabaseStatus('syncing');
    setDatabaseError(null);
    void saveDashboardSnapshot({
      patient,
      doctor: currentDoctor,
      ambulance,
      vitals,
      treatments,
      medications,
      alerts,
      doctorNotes,
    }).then(() => {
      setDatabaseStatus('synced');
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown Firebase error';
      setDatabaseStatus('error');
      setDatabaseError(message);
      console.error('Unable to sync dashboard data with Firestore.', error);
    });
  }, [ambulance, alerts, currentDoctor, doctorNotes, medications, patient, treatments, vitals]);

  return (
    <AmbulanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        vitals,
        patient,
        ambulance,
        treatments,
        medications,
        alerts,
        doctorNotes,
        setDoctorNotes,
        addTreatment,
        addMedication,
        showVoiceCallModal,
        setShowVoiceCallModal,
        showMessageDrawer,
        setShowMessageDrawer,
        showSosModal,
        setShowSosModal,
        isAudioMuted,
        setIsAudioMuted,
        showInfoBanner,
        setShowInfoBanner,
        databaseStatus,
        databaseError,
        triggerAudioBeep,
        isAuthenticated,
        currentDoctor,
        loginDoctor,
        logoutDoctor,
      }}
    >
      {children}
    </AmbulanceContext.Provider>
  );
};

export const useAmbulance = () => {
  const context = useContext(AmbulanceContext);
  if (!context) {
    throw new Error('useAmbulance must be used within an AmbulanceProvider');
  }
  return context;
};
