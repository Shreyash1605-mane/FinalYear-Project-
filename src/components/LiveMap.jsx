import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

const hospitals = [
  { id: 'CPR_Hospital', name: 'CPR Hospital', address: 'Dasara Chowk', coordinates: [16.7006, 74.2260] },
  { id: 'Sachin_Multispecialty', name: 'Sachin Multispecialty', address: 'Rajarampuri', coordinates: [16.6935, 74.2420] },
  { id: 'Aster_Aadhar', name: 'Aster Aadhar', address: 'Shastri Nagar', coordinates: [16.7142, 74.2378] },
  { id: 'Surya_Hospital', name: 'Surya Hospital', address: 'Laxmipuri', coordinates: [16.6970, 74.2310] },
  { id: 'Shrawastie_Hospital', name: 'Shrawastie Hospital', address: 'Shivaji Peth', coordinates: [16.6920, 74.2190] },
  { id: 'Sunshine_Multispecialty', name: 'Sunshine Multispecialty', address: 'Rankala', coordinates: [16.6890, 74.2150] },
  { id: 'Diamond_Hospital', name: 'Diamond Hospital', address: 'Kasaba Bawada', coordinates: [16.7200, 74.2350] },
  { id: 'Tulip_Traumacare', name: 'Tulip Traumacare', address: 'Ruikar Colony', coordinates: [16.7020, 74.2460] },
  { id: 'Athaayu_Hospital', name: 'Athaayu Hospital', address: 'Ujalaiwadi', coordinates: [16.6350, 74.2950] },
  { id: 'Apple_Saraswati', name: 'Apple Saraswati', address: 'Bhosalewadi', coordinates: [16.7060, 74.2470] },
  { id: 'Krishna_Hospital', name: 'Krishna Hospital', address: 'Sambhajinagar', coordinates: [16.6780, 74.2520] },
  { id: 'Asian_Hospital', name: 'Asian Hospital', address: 'Dasara Chowk', coordinates: [16.6990, 74.2300] },
  { id: 'OmHospital', name: 'Om Hospital', address: 'Sambhajinagar', coordinates: [16.6760, 74.2580] },
];

const defaultCenter = [16.7000, 74.2300];

const ambulanceIcon = L.divIcon({
  className: 'ambulance-marker-wrapper',
  html: '<div class="live-ambulance-marker"><span>+</span></div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const hospitalIcon = L.divIcon({
  className: 'route-pin-wrapper',
  html: '<div class="live-hospital-marker">H</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

function MapController({ location, hospital, route }) {
  const map = useMap();

  useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(L.latLngBounds(route), { padding: [48, 48], maxZoom: 15 });
    } else if (location) {
      map.setView([location.latitude, location.longitude], 15);
    }
  }, [hospital, location, map, route]);

  return null;
}

function formatCoordinate(value) {
  return value == null ? '—' : value.toFixed(5);
}

function distanceBetweenLocations(first, second) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDifference = radians(second.latitude - first.latitude);
  const longitudeDifference = radians(second.longitude - first.longitude);
  const value = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(radians(first.latitude))
    * Math.cos(radians(second.latitude))
    * Math.sin(longitudeDifference / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export default function LiveMap() {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(
    () => navigator.geolocation ? '' : 'This browser does not support device location.',
  );
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0].id);
  const [route, setRoute] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);
  const [routeError, setRouteError] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [gpsAttempt, setGpsAttempt] = useState(0);
  const routeRequestId = useRef(0);
  const latestLocation = useRef(null);
  const lastRoutedPosition = useRef(null);
  const isRoutingRef = useRef(false);
  const selectedHospital = hospitals.find((hospital) => hospital.id === selectedHospitalId) ?? hospitals[0];

  useEffect(() => {
    latestLocation.current = location;
  }, [location]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
        });
        setLocationError('');
      },
      (error) => {
        const messages = {
          1: 'Location permission was denied. Allow location access in your browser to start live tracking.',
          2: 'Your device could not determine its location. Check GPS or network location and try again.',
          3: 'Device location timed out. Check your GPS signal and try again.',
        };
        setLocationError(messages[error.code] ?? `Unable to read device location: ${error.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gpsAttempt]);

  const hasLocation = Boolean(location);

  useEffect(() => {
    if (!hasLocation) {
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    const updateRoute = async () => {
      const currentLocation = latestLocation.current;
      if (!currentLocation || isRoutingRef.current) return;

      const previousRoute = lastRoutedPosition.current;
      if (
        previousRoute?.hospitalId === selectedHospitalId
        && distanceBetweenLocations(previousRoute, currentLocation) < 20
      ) {
        return;
      }

      isRoutingRef.current = true;
      const requestId = routeRequestId.current + 1;
      routeRequestId.current = requestId;
      setIsRouting(true);
      setRouteError('');
      const [destinationLatitude, destinationLongitude] = selectedHospital.coordinates;
      const url = new URL(
        `https://router.project-osrm.org/route/v1/driving/${currentLocation.longitude},${currentLocation.latitude};${destinationLongitude},${destinationLatitude}`,
      );
      url.searchParams.set('overview', 'full');
      url.searchParams.set('geometries', 'geojson');
      url.searchParams.set('steps', 'false');

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Directions service returned HTTP ${response.status}.`);
        }

        const result = await response.json();
        const selectedRoute = result.routes?.[0];
        if (result.code !== 'Ok' || !selectedRoute?.geometry?.coordinates?.length) {
          throw new Error('No driving route is available for this location and hospital.');
        }

        if (active && requestId === routeRequestId.current) {
          setRoute(selectedRoute.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]));
          setRouteSummary({
            distanceKm: selectedRoute.distance / 1000,
            durationMinutes: Math.ceil(selectedRoute.duration / 60),
          });
          lastRoutedPosition.current = {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            hospitalId: selectedHospitalId,
          };
          setLastUpdated(new Date());
        }
      } catch (error) {
        if (
          active
          && !(error instanceof Error && error.name === 'AbortError')
          && requestId === routeRequestId.current
        ) {
          setRouteError(error instanceof Error ? error.message : 'Unable to calculate a driving route.');
        }
      } finally {
        if (active) {
          isRoutingRef.current = false;
        }
        if (active && requestId === routeRequestId.current) {
          setIsRouting(false);
        }
      }
    };

    updateRoute();
    const interval = window.setInterval(updateRoute, 5000);

    return () => {
      active = false;
      window.clearInterval(interval);
      routeRequestId.current += 1;
      controller.abort();
      isRoutingRef.current = false;
    };
  }, [hasLocation, selectedHospitalId, selectedHospital]);

  const sourceCoordinates = useMemo(
    () => location ? [location.latitude, location.longitude] : null,
    [location],
  );
  const speedKmh = location?.speed == null ? null : Math.round(location.speed * 3.6);
  const statusText = locationError
    ? 'Location unavailable'
    : isRouting
      ? 'Updating route'
      : location && routeSummary
        ? 'Live navigation'
        : location
          ? 'Getting directions'
          : 'Waiting for GPS';

  return (
    <main className="live-map-page">
      <header className="live-map-header">
        <div>
          <p className="live-map-eyebrow">AMBULANCE NAVIGATION</p>
          <h1>Live route to hospital</h1>
          <p className="live-map-subtitle">Your device location is used as the live starting point.</p>
        </div>
        <div className={`live-map-status ${location && !locationError ? 'status-navigating' : 'status-paused'}`}>
          <span className="status-dot" />
          {statusText}
        </div>
      </header>

      <div className="live-map-layout">
        <aside className="navigation-panel">
          <h2>Trip details</h2>
          <label className="navigation-label" htmlFor="hospital-destination">Destination hospital</label>
          <select
            id="hospital-destination"
            value={selectedHospitalId}
            onChange={(event) => {
              setSelectedHospitalId(event.target.value);
              setRoute([]);
              setRouteSummary(null);
              setRouteError('');
            }}
          >
            {hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name} — {hospital.address}
              </option>
            ))}
          </select>

          <div className="live-location-card">
            <span className="live-location-icon">●</span>
            <div>
              <span className="live-location-caption">Starting point · device GPS</span>
              <strong>{location ? 'Current device location' : 'Waiting for location permission'}</strong>
              {location && (
                <small>
                  {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
                  {' · ±'}{Math.round(location.accuracy)} m
                </small>
              )}
            </div>
          </div>

          <div className="route-stats">
            <div className="route-stat">
              <span>ROAD DISTANCE</span>
              <strong>{routeSummary ? `${routeSummary.distanceKm.toFixed(1)} km` : '—'}</strong>
            </div>
            <div className="route-stat">
              <span>EST. DRIVE TIME</span>
              <strong>{routeSummary ? `${routeSummary.durationMinutes} min` : '—'}</strong>
            </div>
          </div>

          <div className="live-destination">
            <span className="live-hospital-dot">H</span>
            <div>
              <span className="live-location-caption">DESTINATION</span>
              <strong>{selectedHospital.name}</strong>
              <small>{selectedHospital.address}, Kolhapur</small>
            </div>
          </div>

          <div className="live-telemetry">
            <span>Device speed</span>
            <strong>{speedKmh == null ? '—' : `${speedKmh} km/h`}</strong>
          </div>

          {locationError && (
            <div className="navigation-error" role="alert">
              <strong>Live location is unavailable</strong>
              <p>{locationError}</p>
              <button className="navigation-button secondary-button" onClick={() => setGpsAttempt((attempt) => attempt + 1)}>
                Try location again
              </button>
            </div>
          )}

          {routeError && (
            <div className="navigation-error" role="alert">
              <strong>Could not update directions</strong>
              <p>{routeError}</p>
            </div>
          )}

          {lastUpdated && !routeError && (
            <p className="live-updated-time">
              Route updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
          <p className="live-map-disclaimer">
            Route and drive-time estimates are provided by OpenStreetMap-based directions and do not include live traffic.
          </p>
        </aside>

        <section className="map-panel" aria-label="Live ambulance route map">
          <MapContainer
            center={sourceCoordinates ?? defaultCenter}
            zoom={sourceCoordinates ? 15 : 13}
            className="ambulance-map"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController location={location} hospital={selectedHospitalId} route={route} />
            {sourceCoordinates && (
              <Marker position={sourceCoordinates} icon={ambulanceIcon}>
                <Popup>
                  <strong>Current device location</strong>
                  <br />
                  GPS accuracy: {Math.round(location.accuracy)} m
                </Popup>
              </Marker>
            )}
            <Marker position={selectedHospital.coordinates} icon={hospitalIcon}>
              <Popup>
                <strong>{selectedHospital.name}</strong>
                <br />
                {selectedHospital.address}, Kolhapur
              </Popup>
            </Marker>
            {route.length > 1 && (
              <Polyline positions={route} pathOptions={{ color: '#1769ff', weight: 6, opacity: 0.88 }} />
            )}
          </MapContainer>
          <div className="map-legend" aria-label="Map legend">
            <span><i className="legend-live-location" /> Your device</span>
            <span><i className="legend-destination" /> Hospital</span>
            <span><i className="legend-route" /> Driving route</span>
          </div>
        </section>
      </div>
    </main>
  );
}
