export interface RuralHub {
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
}

export const RURAL_HUBS: RuralHub[] = [
  { name: "Greenfield Village, Ward 3", district: "Salem Rural", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460 },
  { name: "Sunrise Agro Hamlet", district: "Erode Rural", state: "Tamil Nadu", lat: 11.3410, lng: 77.7172 },
  { name: "Riverdale Farmer Colony", district: "Namakkal", state: "Tamil Nadu", lat: 11.2189, lng: 78.1674 },
  { name: "Oakridge Panchayat Valley", district: "Dharmapuri", state: "Tamil Nadu", lat: 12.1211, lng: 78.1582 },
  { name: "Lotus Creek Community", district: "Karur West", state: "Tamil Nadu", lat: 10.9601, lng: 78.0766 },
  { name: "Highland Terrace Hamlet", district: "Coimbatore East", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}
