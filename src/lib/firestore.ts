import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { hospitalLocations } from '../data/hospitalLocations';
import type {
  AlertItem,
  AmbulanceLocation,
  DoctorUser,
  Medication,
  PatientInfo,
  Treatment,
  VitalMetric,
} from '../types';

interface DashboardSnapshot {
  patient: PatientInfo;
  doctor: DoctorUser;
  ambulance: AmbulanceLocation;
  vitals: VitalMetric[];
  treatments: Treatment[];
  medications: Medication[];
  alerts: AlertItem[];
  doctorNotes: string;
}

const updatedAt = () => serverTimestamp();

export async function saveDashboardSnapshot(snapshot: DashboardSnapshot): Promise<void> {
  const batch = writeBatch(db);
  const patientRef = doc(collection(db, 'Patient'), snapshot.patient.id);
  const doctorRef = doc(collection(db, 'doctors'), snapshot.doctor.id);
  const ambulanceRef = doc(collection(db, 'Ambulance'), snapshot.ambulance.ambulanceId);
  const telemetrySessionId = `${snapshot.ambulance.ambulanceId}_${snapshot.patient.id}`;
  const telemetrySessionRef = doc(collection(db, 'TelemetrySession'), telemetrySessionId);
  const adminRef = doc(collection(db, 'admins'), 'system-admin');
  const systemRef = doc(collection(db, 'system'), 'dashboard');

  batch.set(patientRef, {
    fullName: snapshot.patient.name,
    dateOfBirth: Timestamp.fromDate(new Date(snapshot.patient.dob ?? '1970-01-01')),
    bloodType: snapshot.patient.bloodGroup,
    medicalHistory: snapshot.patient.primaryDiagnosis ?? 'No medical history recorded',
    emergencyContactName: snapshot.patient.emergencyContactName ?? null,
    emergencyContactPhone: snapshot.patient.emergencyContactPhone ?? null,
    patientId: snapshot.patient.id,
    role: 'patient',
    updatedAt: updatedAt(),
  }, { merge: true });
  batch.set(doctorRef, { ...snapshot.doctor, role: 'doctor', updatedAt: updatedAt() }, { merge: true });
  batch.set(ambulanceRef, {
    licensePlate: snapshot.ambulance.ambulanceId,
    status: snapshot.ambulance.status,
    currentLat: snapshot.ambulance.lat,
    currentLng: snapshot.ambulance.lng,
    lastMaintenanceDate: null,
    ambulanceId: snapshot.ambulance.ambulanceId,
    updatedAt: updatedAt(),
  }, { merge: true });
  batch.set(telemetrySessionRef, {
    startTime: updatedAt(),
    currentVitals: JSON.stringify(snapshot.vitals),
    ecgDataStream: JSON.stringify([]),
    ambulance: snapshot.ambulance.ambulanceId,
    patient: snapshot.patient.id,
    ambulanceId: snapshot.ambulance.ambulanceId,
    patientId: snapshot.patient.id,
    updatedAt: updatedAt(),
  }, { merge: true });

  for (const hospital of hospitalLocations) {
    batch.set(doc(collection(db, 'Hospital'), hospital.id), {
      name: hospital.name,
      locationLat: hospital.lat,
      locationLng: hospital.lng,
      address: hospital.name,
      departmentContactNumber: null,
      currentCapacityStatus: 'Unknown',
      updatedAt: updatedAt(),
    }, { merge: true });
  }

  batch.set(adminRef, {
    id: 'system-admin',
    role: 'admin',
    permissions: ['manage-patients', 'manage-doctors', 'manage-ambulances', 'manage-settings'],
    updatedAt: updatedAt(),
  }, { merge: true });
  batch.set(systemRef, {
    doctorNotes: snapshot.doctorNotes,
    activePatientId: snapshot.patient.id,
    activeDoctorId: snapshot.doctor.id,
    activeAmbulanceId: snapshot.ambulance.ambulanceId,
    updatedAt: updatedAt(),
  }, { merge: true });

  for (const treatment of snapshot.treatments) {
    batch.set(doc(collection(db, 'TreatmentLog'), treatment.id), {
      timestamp: updatedAt(),
      actionType: treatment.category ?? 'TREATMENT',
      description: treatment.description,
      telemetrySession: telemetrySessionId,
      telemetrySessionId,
      updatedAt: updatedAt(),
    }, { merge: true });
  }

  for (const medication of snapshot.medications) {
    batch.set(doc(collection(db, 'TreatmentLog'), `medication_${medication.id}`), {
      timestamp: updatedAt(),
      actionType: 'MEDICATION',
      description: `${medication.name} ${medication.dosage}`,
      telemetrySession: telemetrySessionId,
      telemetrySessionId,
      updatedAt: updatedAt(),
    }, { merge: true });
  }

  for (const alert of snapshot.alerts) {
    batch.set(doc(collection(db, 'Alert'), alert.id), {
      type: alert.type,
      severity: alert.type === 'critical' ? 'HIGH' : alert.type === 'warning' ? 'MEDIUM' : 'LOW',
      timestamp: updatedAt(),
      telemetrySession: telemetrySessionId,
      telemetrySessionId,
      updatedAt: updatedAt(),
    }, { merge: true });
  }

  await batch.commit();
}
