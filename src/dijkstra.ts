import { hospitalLocations, rankalaLocation } from './data/hospitalLocations';

export interface GraphEdge {
  node: string;
  distance: number;
}

export type WeightedGraph = Record<string, GraphEdge[]>;

interface Coordinate {
  lat: number;
  lng: number;
}

const coordinates: Record<string, Coordinate> = {
  DeviceLocation: rankalaLocation,
  ...Object.fromEntries(hospitalLocations.map((hospital) => [hospital.id, hospital])),
};

const distanceBetween = (first: Coordinate, second: Coordinate) => {
  const earthRadiusKm = 6371;
  const latitudeDelta = (second.lat - first.lat) * Math.PI / 180;
  const longitudeDelta = (second.lng - first.lng) * Math.PI / 180;
  const firstLatitude = first.lat * Math.PI / 180;
  const secondLatitude = second.lat * Math.PI / 180;
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.sin(longitudeDelta / 2) ** 2
      * Math.cos(firstLatitude)
      * Math.cos(secondLatitude);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const kolhapurCityGraph: WeightedGraph = Object.keys(coordinates).reduce((graph, source) => {
  graph[source] = Object.keys(coordinates)
    .filter((destination) => destination !== source)
    .map((destination) => ({
      node: destination,
      distance: distanceBetween(coordinates[source], coordinates[destination]),
    }));
  return graph;
}, {} as WeightedGraph);

export interface ShortestPathResult {
  distance: number | null;
  path: string[];
}

export function findShortestPath(
  graph: WeightedGraph,
  start: string,
  destination: string,
): ShortestPathResult {
  if (!graph[start] || !graph[destination]) {
    return { distance: null, path: [] };
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | undefined>();
  const unvisited = new Set(Object.keys(graph));

  for (const node of unvisited) {
    distances.set(node, node === start ? 0 : Infinity);
  }

  while (unvisited.size > 0) {
    let current: string | undefined;
    let currentDistance = Infinity;

    for (const node of unvisited) {
      const distance = distances.get(node) ?? Infinity;
      if (distance < currentDistance) {
        current = node;
        currentDistance = distance;
      }
    }

    if (!current || currentDistance === Infinity) break;
    unvisited.delete(current);
    if (current === destination) break;

    for (const edge of graph[current]) {
      if (!unvisited.has(edge.node)) continue;
      const candidateDistance = currentDistance + edge.distance;
      if (candidateDistance < (distances.get(edge.node) ?? Infinity)) {
        distances.set(edge.node, candidateDistance);
        previous.set(edge.node, current);
      }
    }
  }

  const distance = distances.get(destination);
  if (distance === undefined || distance === Infinity) {
    return { distance: null, path: [] };
  }

  const path: string[] = [];
  let current: string | undefined = destination;
  while (current) {
    path.unshift(current);
    current = previous.get(current);
  }

  return { distance, path };
}

export function findNearestHospital(source = 'DeviceLocation') {
  return hospitalLocations
    .map((hospital) => ({
      hospital,
      route: findShortestPath(kolhapurCityGraph, source, hospital.id),
    }))
    .filter(({ route }) => route.distance !== null)
    .sort((first, second) => (first.route.distance ?? Infinity) - (second.route.distance ?? Infinity))[0];
}
