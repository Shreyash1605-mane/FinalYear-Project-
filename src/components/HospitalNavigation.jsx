import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { kolhapurCityGraph, findShortestPath } from '../dijkstra';
import { hospitalLocations } from '../data/hospitalLocations';

// Leaflet default marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Source साठी (Blue Icon) आणि Destination Hospital साठी (Green Icon) वेगळे चिन्ह
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deviceIcon = L.divIcon({
  className: 'device-location-marker',
  html: '<span style="display:block;width:18px;height:18px;border:3px solid #fff;border-radius:50%;background:#2563eb;box-shadow:0 0 0 7px rgba(37,99,235,.25)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function FitRouteBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), {
        padding: [48, 48],
        maxZoom: 15,
        animate: true
      });
    }
  }, [map, positions]);

  return null;
}

const nodeCoordinates = {
  //Shahupuri: [16.7028, 74.2410],
  Rajarampuri: [16.6947, 74.2443],
  TarabaiPark: [16.7115, 74.2415],
  NagalaPark: [16.7050, 74.2250],
  Laxmipuri: [16.6980, 74.2320],
  ShivajiPeth: [16.6910, 74.2150],
  Rankala: [16.6873, 74.2185],
  KasabaBawada: [16.7250, 74.2400],
  Kalamba: [16.6650, 74.2050],
  Ujalaiwadi: [16.6400, 74.3000],
  ShiroliNaka: [16.7500, 74.2600],
  Kadamwadi: [16.7120, 74.2500],
  Bhosalewadi: [16.7080, 74.2480],
  RuikarColony: [16.7050, 74.2450],
  Phulewadi: [16.6800, 74.2000],
  DeokarPanand: [16.6900, 74.2350],
  Sambhajinagar: [16.6750, 74.2550],
  ShahuNaka: [16.7150, 74.2400],
  DabholkarCorner: [16.7090, 74.2380],
  DasaraChowk: [16.6980, 74.2290],
  BinduChowk: [16.6930, 74.2230],
  Gangavesh: [16.6950, 74.2100],
  PapachiTikati: [16.6960, 74.2200],
  RailwayStation: [16.7040, 74.2350],
  ShahuMaidan: [16.7010, 74.2380],
  Venus_Corner: [16.7015, 74.2335],
  StationRd: [16.7080, 74.2350],
  Takala_Signal: [16.6930, 74.2470],
  '6th_Lane': [16.6915, 74.2490],
  Shahu_Mill_Rd: [16.6900, 74.2460],
  ShastriNagar: [16.7100, 74.2340],
  Ford_Corner: [16.6970, 74.2300],
  Dudhali: [16.6900, 74.2145],
  RankalaRd: [16.6850, 74.2165],
  Rankala_Bypass: [16.6815, 74.2210],
  Gangavesh_Signal: [16.6935, 74.2075],
  TownHall: [16.7200, 74.2340],
  CPR_Chowk: [16.7180, 74.2300],
  Bawada_Alternate: [16.7280, 74.2480],
  RadhanagariRd: [16.6720, 74.2180],
  AirportRd: [16.6460, 74.2860],
  NH48: [16.7440, 74.2780],
  CircuitHouse: [16.7150, 74.2460],
  Ruikar_Colony_Signal: [16.7060, 74.2470],
  Crusher_Chowk: [16.7040, 74.2300],
  Sambhajinagar_Junction: [16.6740, 74.2510],
  Tarabai_Side: [16.7080, 74.2390],
  Dabholkar_Signal: [16.7100, 74.2360],
  Bindu_Chowk_Signal: [16.6920, 74.2210],
  Bindu_Side: [16.6950, 74.2220],
  Dabholkar_Corner: [16.7080, 74.2360],
  // Hospitals
  CPR_Hospital: [16.7006, 74.2260],
  Sachin_Multispecialty: [16.6935, 74.2420],
  Aster_Aadhar: [16.7142, 74.2378],
  Surya_Hospital: [16.6970, 74.2310],
  Shrawastie_Hospital: [16.6920, 74.2190],
  Sunshine_Multispecialty: [16.6890, 74.2150],
  Diamond_Hospital: [16.7200, 74.2350],
  Tulip_Traumacare: [16.7020, 74.2460],
  Athaayu_Hospital: [16.6350, 74.2950],
  Apple_Saraswati: [16.7060, 74.2470],
  Krishna_Hospital: [16.6780, 74.2520],
  Asian_Hospital: [16.6990, 74.2300],
  OmHospital: [16.6760, 74.2580]
};

// सर्व हॉस्पिटल्सची यादी
const hospitalList = hospitalLocations.map(({ id }) => id);

export default function LiveMap() {
  const [startNode, setStartNode] = useState('Rankala');
  const deviceLocation = nodeCoordinates.Rankala;

  // डायकस्ट्रा वापरून सर्वात जवळचे हॉस्पिटल शोधणे
  let nearestHospital = "CPR_Hospital";
  let minDistance = Infinity;
  let bestPath = [];

  hospitalList.forEach(hosp => {
    const res = findShortestPath(kolhapurCityGraph, startNode, hosp);
    if (res.distance !== null && res.distance < minDistance) {
      minDistance = res.distance;
      nearestHospital = hosp;
      bestPath = res.path;
    }
  });

  const polylineCoords = bestPath.map(node => nodeCoordinates[node] || [16.7000, 74.2300]);
  const sourceCoords = nodeCoordinates[startNode] || [16.6873, 74.2185];
  const hospitalCoords = nodeCoordinates[nearestHospital] || [16.7006, 74.2260];

  return (
    <div style={{ padding: "15px", backgroundColor: "#0f172a", color: "#fff", borderRadius: "10px" }}>
      {/* Top Bar: Dropdown to change Source Location */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>🚑 Smart Ambulance Routing (Kolhapur)</h2>
        
        {/* Accident Spot Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Select Accident Spot (Source):</label>
          <select 
            value={startNode} 
            onChange={(e) => setStartNode(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "5px", backgroundColor: "#1e293b", color: "#fff", border: "1px solid #475569", cursor: "pointer" }}
          >
            {Object.keys(kolhapurCityGraph)
              .filter(node => !hospitalList.includes(node)) // फक्त जंक्शन्स किंवा एरिया सोर्स म्हणून दाखवणे
              .map(node => (
                <option key={node} value={node}>{node.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "10px", fontSize: "0.9rem" }}>
        <strong>Fixed Device Location: </strong>
        <span style={{ color: "#60a5fa", fontWeight: "bold" }}>Rankala</span> | 
        <strong> Route Source: </strong>
        <span>{startNode.replace(/_/g, ' ')}</span> | 
        <strong>Assigned Nearest Hospital: </strong>
        <span style={{ color: "#4ade80", fontWeight: "bold" }}>{nearestHospital.replace(/_/g, ' ')}</span> | 
        <span> Shortest Distance: {minDistance} km</span>
      </div>

      {/* Map Container */}
      <MapContainer 
        center={sourceCoords} 
        zoom={14} 
        style={{ height: "480px", width: "100%", borderRadius: "8px" }}
        key={startNode}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {startNode !== 'Rankala' && (
          <Marker position={deviceLocation} icon={deviceIcon}>
            <Popup><b>Fixed Device Location:</b> Rankala</Popup>
          </Marker>
        )}

        {/* Source Marker (Blue Icon) */}
        <Marker position={sourceCoords} icon={blueIcon}>
          <Popup>
            <b>{startNode === 'Rankala' ? 'Fixed Device Location and Route Source:' : 'Selected Route Source:'}</b>{' '}
            {startNode.replace(/_/g, ' ')}
          </Popup>
        </Marker>

        {/* Destination Hospital Marker (Green Icon) */}
        <Marker position={hospitalCoords} icon={greenIcon}>
          <Popup><b>Nearest Hospital (Destination):</b> {nearestHospital.replace(/_/g, ' ')}</Popup>
        </Marker>

        {/* Route Polyline connecting Source to Nearest Hospital */}
        <Polyline 
          positions={polylineCoords} 
          color="#3b82f6" 
          weight={6} 
          opacity={0.8}
        />
        <FitRouteBounds positions={polylineCoords} />
      </MapContainer>
    </div>
  );
}