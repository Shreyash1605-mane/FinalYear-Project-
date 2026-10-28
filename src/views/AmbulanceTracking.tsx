import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, Gauge, MapPin, Navigation, ShieldCheck, Volume2 } from 'lucide-react';
import { useAmbulance } from '../context/AmbulanceContext';
import { hospitalLocations } from '../data/hospitalLocations';

type RouteState = {
  coordinates: [number, number][];
  distanceKm: number;
  durationMins: number;
};

const createMarker = (color: string, label: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px"><span style="transform:rotate(45deg)">${label}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });

const deviceIcon = createMarker('#2563eb', 'A');
const hospitalIcon = createMarker('#16a34a', '+');

const FitRouteBounds: React.FC<{ coordinates: [number, number][] }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 1) {
      map.fitBounds(L.latLngBounds(coordinates), { padding: [48, 48], maxZoom: 15 });
    }
  }, [coordinates, map]);

  return null;
};

const formatDuration = (minutes: number) => {
  if (minutes < 1) return '<1 min';
  const roundedMinutes = Math.round(minutes);
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;
  return hours > 0 ? `${hours} hr ${remainingMinutes} min` : `${remainingMinutes} min`;
};

export const AmbulanceTracking: React.FC = () => {
  const { ambulance, isAudioMuted, setIsAudioMuted } = useAmbulance();
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitalLocations[0].id);
  const [route, setRoute] = useState<RouteState | null>(null);
  const [routeStatus, setRouteStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [routeError, setRouteError] = useState<string | null>(null);

  const source: [number, number] = [ambulance.lat, ambulance.lng];
  const selectedHospital = useMemo(
    () => hospitalLocations.find((hospital) => hospital.id === selectedHospitalId) ?? hospitalLocations[0],
    [selectedHospitalId],
  );
  const sourceLat = ambulance.lat;
  const sourceLng = ambulance.lng;
  const destinationLat = selectedHospital.lat;
  const destinationLng = selectedHospital.lng;
  const destination: [number, number] = [destinationLat, destinationLng];
  const routeCoordinates = route?.coordinates ?? [source, destination];
  const distanceKm = route?.distanceKm ?? 0;
  const durationMins = route?.durationMins ?? 0;

  useEffect(() => {
    const controller = new AbortController();
    const loadRoute = async () => {
      setRouteStatus('loading');
      setRouteError(null);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${sourceLng},${sourceLat};${destinationLng},${destinationLat}?overview=full&geometries=geojson&alternatives=false&steps=false`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Routing service returned ${response.status}.`);
        const data = (await response.json()) as {
          code?: string;
          routes?: Array<{
            distance: number;
            duration: number;
            geometry: { coordinates: [number, number][] };
          }>;
        };
        const osrmRoute = data.routes?.[0];
        if (data.code !== 'Ok' || !osrmRoute) throw new Error('No drivable route was found.');

        setRoute({
          coordinates: osrmRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
          distanceKm: osrmRoute.distance / 1000,
          durationMins: osrmRoute.duration / 60,
        });
        setRouteStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        setRoute(null);
        setRouteStatus('error');
        setRouteError(error instanceof Error ? error.message : 'Unable to load the route.');
      }
    };

    void loadRoute();
    return () => controller.abort();
  }, [destinationLat, destinationLng, sourceLat, sourceLng]);

  return (
    <div className="p-4 space-y-4 min-h-[calc(100vh-80px)]">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-extrabold text-white">
            <Navigation className="h-5 w-5 text-blue-400" /> Live Ambulance Tracking
          </h1>
          <p className="mt-1 text-xs text-slate-400">Device location to the selected hospital using the shortest available road route.</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          Destination hospital
          <select
            value={selectedHospital.id}
            onChange={(event) => setSelectedHospitalId(event.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
          >
            {hospitalLocations.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="relative min-h-[560px] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
          <MapContainer center={source} zoom={14} className="h-[560px] w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={source} icon={deviceIcon}>
              <Popup><strong>Ambulance device location</strong><br />AMB-108 telemetry source</Popup>
            </Marker>
            <Marker position={destination} icon={hospitalIcon}>
              <Popup><strong>{selectedHospital.name}</strong><br />Selected destination hospital</Popup>
            </Marker>
            {route && (
              <Polyline positions={route.coordinates} pathOptions={{ color: '#2563eb', weight: 7, opacity: 0.9 }} />
            )}
            <FitRouteBounds coordinates={routeCoordinates} />
          </MapContainer>
          {routeStatus === 'loading' && (
            <div className="absolute left-4 top-4 z-[1000] rounded-lg bg-slate-950/90 px-3 py-2 text-xs text-blue-200">
              Calculating shortest road route...
            </div>
          )}
          {routeStatus === 'error' && (
            <div className="absolute left-4 right-4 top-4 z-[1000] rounded-lg border border-amber-500/40 bg-slate-950/95 px-3 py-2 text-xs text-amber-200">
              {routeError} Distance and ETA are unavailable until routing reconnects.
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-700/80 bg-[#0b1328]/95 p-5 text-slate-100 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-extrabold">AMB-108</h2>
              <p className="text-xs text-slate-400">Live device telemetry</p>
            </div>
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`rounded-lg p-2 ${isAudioMuted ? 'bg-slate-800 text-slate-400' : 'bg-red-500/20 text-red-400'}`}
              title={isAudioMuted ? 'Unmute siren' : 'Mute siren'}
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-400">Destination</span><strong className="max-w-[150px] text-right text-white">{selectedHospital.name}</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-400"><MapPin className="h-4 w-4 text-blue-400" />Device source</span><strong className="text-white">{source[0].toFixed(4)}, {source[1].toFixed(4)}</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-400"><Navigation className="h-4 w-4 text-blue-400" />Shortest route</span><strong className="text-white">{routeStatus === 'ready' ? `${distanceKm.toFixed(1)} km` : '--'}</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-400"><Clock className="h-4 w-4 text-amber-400" />ETA</span><strong className="text-white">{routeStatus === 'ready' ? formatDuration(durationMins) : '--'}</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-400"><Gauge className="h-4 w-4 text-emerald-400" />Speed</span><strong className="text-white">{ambulance.speedKmh} km/h</strong></div>
          </div>
          <div className="mt-6 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> {routeStatus === 'ready' ? 'Route synchronized' : 'Waiting for route'}
          </div>
        </aside>
      </div>
    </div>
  );
};
