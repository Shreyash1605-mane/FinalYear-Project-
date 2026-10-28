import { doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { AmbulanceTelemetry } from '../types';

export const ambulanceTelemetryPath = (ambulanceId: string) =>
  `Ambulance/${ambulanceId}/telemetry/live`;

const telemetryDocument = (ambulanceId: string) =>
  doc(db, 'Ambulance', ambulanceId, 'telemetry', 'live');

export function subscribeToAmbulanceTelemetry(
  ambulanceId: string,
  onTelemetry: (telemetry: AmbulanceTelemetry) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(telemetryDocument(ambulanceId), (snapshot) => {
    if (!snapshot.exists()) return;

    const data = snapshot.data();
    if (typeof data.ambulanceId !== 'string') {
      onError(new Error(`Telemetry document ${ambulanceTelemetryPath(ambulanceId)} has no ambulanceId.`));
      return;
    }

    onTelemetry({
      ambulanceId: data.ambulanceId,
      timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
      heartRate: Number(data.heartRate),
      spo2: Number(data.spo2),
      bloodPressure: String(data.bloodPressure),
      respiratoryRate: Number(data.respiratoryRate),
      temperature: Number(data.temperature),
      ecgWaveform: Array.isArray(data.ecgWaveform) ? data.ecgWaveform.map(Number) : [],
      cameraStreamUrl: typeof data.cameraStreamUrl === 'string' ? data.cameraStreamUrl : undefined,
      intercomChannelId: typeof data.intercomChannelId === 'string' ? data.intercomChannelId : undefined,
      connectionStatus: data.connectionStatus === 'offline' ? 'offline' : 'online',
    });
  }, onError);
}

/**
 * Hardware gateway entry point. The gateway should call this after validating
 * the payload received from the ambulance sensor controller.
 */
export async function publishAmbulanceTelemetry(
  telemetry: Omit<AmbulanceTelemetry, 'timestamp'>,
): Promise<void> {
  await setDoc(telemetryDocument(telemetry.ambulanceId), {
    ...telemetry,
    timestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
