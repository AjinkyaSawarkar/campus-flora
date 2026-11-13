import { CAMPUS } from "../content/site";

/** Distance between two points on the ground, in kilometres. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** True when a position is on (or right next to) the campus. Photos sent from elsewhere get no pin. */
export const onCampus = (lat: number, lng: number) => distanceKm(lat, lng, CAMPUS.lat, CAMPUS.lng) <= CAMPUS.radiusKm;
