import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

// Create custom icons for trucks
const createTruckIcon = (color) => {
  return L.divIcon({
    className: 'custom-truck-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const iconMap = {
  'ON TRACK': createTruckIcon('#10b981'), // emerald-500
  'DELAYED': createTruckIcon('#ef4444'),   // red-500
  'MAINTENANCE': createTruckIcon('#f59e0b') // amber-500
};

const DEFAULT_VEHICLES = [
  { id: 'MH12AB1234', lat: 28.7041, lng: 77.1025, status: 'ON TRACK', dest: 'KANPUR' },
  { id: 'UP14CD5678', lat: 27.1767, lng: 78.0081, status: 'DELAYED', dest: 'AGRA' },
  { id: 'KA01XY9876', lat: 19.0760, lng: 72.8777, status: 'MAINTENANCE', dest: 'DELHI' },
  { id: 'GJ05GH1122', lat: 23.0225, lng: 72.5714, status: 'ON TRACK', dest: 'MUMBAI' },
  { id: 'WB04XY5566', lat: 22.5726, lng: 88.3639, status: 'ON TRACK', dest: 'PATNA' },
];

const DEFAULT_RISK_ZONES = [
  { id: 'zone1', lat: 27.1767, lng: 78.0081, radius: 45000, intensity: 0.5, name: 'HEAVY RAIN (NH19 BOTTLENECK)' },
  { id: 'zone2', lat: 19.0760, lng: 72.8777, radius: 30000, intensity: 0.3, name: 'PORT CONGESTION' },
];

export default function LiveMap() {
  const [vehicles, setVehicles] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to vehicles collection
    const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      const vList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(vList);
    });

    // Listen to risk_zones collection
    const unsubRiskZones = onSnapshot(collection(db, 'risk_zones'), (snapshot) => {
      const rList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRiskZones(rList);
      setLoading(false);
    });

    return () => {
      unsubVehicles();
      unsubRiskZones();
    };
  }, []);

  const handleSeedData = async () => {
    try {
      for (const v of DEFAULT_VEHICLES) {
        await setDoc(doc(db, 'vehicles', v.id), v);
      }
      for (const r of DEFAULT_RISK_ZONES) {
        await setDoc(doc(db, 'risk_zones', r.id), r);
      }
      alert('Mock Data Seeded to Firestore Successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Failed to seed data. Check your Firebase rules and config.');
    }
  };

  return (
    <div className="w-full h-full relative z-0 rounded-md overflow-hidden border border-gray-200 dark:border-slate-700">
      
      {/* Fallback button if Firestore is empty */}
      {!loading && vehicles.length === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button 
            onClick={handleSeedData}
            className="bg-emerald-600 text-white font-bold tracking-widest text-xs px-6 py-3 rounded-md shadow-lg hover:bg-emerald-500"
          >
            SEED MOCK DATA TO FIRESTORE
          </button>
        </div>
      )}

      <MapContainer 
        center={[23.5, 79.0]} 
        zoom={5} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Render Risk Heatmap Zones */}
        {riskZones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              color: 'transparent',
              fillColor: '#ef4444',
              fillOpacity: zone.intensity
            }}
          >
            <Popup>
              <div className="font-bold uppercase tracking-widest text-xs text-red-600 m-0">
                ⚠️ RISK ZONE: {zone.name}
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Render Live Vehicles */}
        {vehicles.map((v) => (
          <Marker 
            key={v.id} 
            position={[v.lat, v.lng]} 
            icon={iconMap[v.status] || iconMap['ON TRACK']}
          >
            <Popup>
              <div className="font-bold uppercase tracking-wider text-[10px] m-0">
                <div className="text-slate-800 mb-1">UNIT: {v.id}</div>
                <div className="text-slate-600 mb-2">DEST: {v.dest}</div>
                <div className={`px-2 py-1 text-white rounded-sm inline-block ${
                  v.status === 'ON TRACK' ? 'bg-emerald-600' : 
                  v.status === 'DELAYED' ? 'bg-red-600' : 'bg-amber-500'
                }`}>
                  {v.status}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
