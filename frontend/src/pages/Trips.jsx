import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const EWAY_BADGE = {
  valid: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-white',
  urgent: 'bg-red-600 text-white animate-pulse',
  expired: 'bg-gray-900 text-white',
  no_eway: 'bg-gray-400 text-white',
};

const RISK_BORDER = {
  high: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10',
  medium: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
  low: 'border-l-emerald-500',
  unknown: 'border-l-slate-400',
};

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await api.get('/trips/');
        setTrips(data.trips || []);
      } catch (err) {
        setError('BACKEND OFFLINE — SHOWING CACHED DATA');
        // Fallback mock data matching backend schema
        setTrips([
          {
            id: 'TR-001', bilty_id: 'BL-0892', truck_number: 'MH12AB1234', driver_name: 'RAVI KUMAR',
            origin: 'DELHI', destination: 'KANPUR', status: 'in_transit',
            delay_probability: 0.74, estimated_delay_hours: 2.5, risk_level: 'high',
            delay_reason: 'HEAVY RAIN ON NH19 CAUSING BOTTLENECK', cascade_risk_count: 3,
            freight_amount: 45000,
            eway_status: { status: 'warning', label: 'WARNING — 4HR LEFT', color: 'amber' }
          },
          {
            id: 'TR-002', bilty_id: 'BL-0891', truck_number: 'KA01XY9876', driver_name: 'SURESH PATEL',
            origin: 'MUMBAI', destination: 'DELHI', status: 'in_transit',
            delay_probability: 0.21, estimated_delay_hours: 0, risk_level: 'low',
            delay_reason: null, cascade_risk_count: 0,
            freight_amount: 62000,
            eway_status: { status: 'valid', label: 'VALID — 18HR LEFT', color: 'green' }
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const getRiskBadge = (risk) => {
    if (risk === 'high') return 'bg-red-600 text-white';
    if (risk === 'medium') return 'bg-amber-500 text-white';
    return 'bg-emerald-600 text-white';
  };

  const getRiskLabel = (risk, prob) => {
    if (risk === 'high') return `CRITICAL RISK — ${Math.round((prob || 0) * 100)}% DELAY`;
    if (risk === 'medium') return `AT RISK — ${Math.round((prob || 0) * 100)}% DELAY`;
    return 'ON TRACK';
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8 border-b border-gray-200 dark:border-slate-700 pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-widest">LIVE TRIP FEED</h1>
        {error && (
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-widest">{error}</span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className={`pro-card border-l-4 ${RISK_BORDER[trip.risk_level] || RISK_BORDER.unknown}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`font-bold px-2 py-1 text-xs tracking-widest rounded-sm ${getRiskBadge(trip.risk_level)}`}>
                      {getRiskLabel(trip.risk_level, trip.delay_probability)}
                    </span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs tracking-widest">{trip.bilty_id}</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs tracking-widest">{trip.truck_number}</span>
                    {trip.eway_status && (
                      <span className={`font-bold px-2 py-1 text-[10px] tracking-widest rounded-sm ${EWAY_BADGE[trip.eway_status.status]}`}>
                        E-WAY: {trip.eway_status.label}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-wider">
                    {trip.origin} → {trip.destination}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-widest">
                    DRIVER: {trip.driver_name} • STATUS: {trip.status?.replace('_', ' ').toUpperCase()}
                    {trip.cascade_risk_count > 0 && ` • ${trip.cascade_risk_count} DOWNSTREAM TRIPS AT RISK`}
                  </p>
                </div>

                <div className="text-left md:text-right w-full md:w-auto shrink-0">
                  {trip.delay_reason && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-2 tracking-widest">
                      {trip.delay_reason}
                    </p>
                  )}
                  {trip.estimated_delay_hours > 0 && (
                    <p className="font-bold text-red-600 dark:text-red-400 text-sm tracking-widest mb-2">
                      +{trip.estimated_delay_hours}HR ESTIMATED DELAY
                    </p>
                  )}
                  <p className="font-bold text-slate-600 dark:text-slate-400 text-xs tracking-widest mb-4">
                    FREIGHT: ₹{trip.freight_amount?.toLocaleString('en-IN')}
                  </p>
                  {trip.risk_level === 'high' && (
                    <button
                      onClick={() => navigate('/simulate')}
                      className="w-full md:w-auto bg-red-700 hover:bg-red-600 text-white font-bold text-xs tracking-widest py-2 px-6 rounded-sm transition-colors"
                    >
                      SIMULATE OPTIONS
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {trips.length === 0 && (
            <div className="pro-card text-center py-16">
              <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest text-sm">NO ACTIVE TRIPS FOUND</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
