import { useState, useEffect } from 'react';
import LiveMap from '../components/LiveMap';
import { api } from '../api';

const FALLBACK_SUMMARY = {
  total_active_trips: 5,
  high_risk_trips: 2,
  trucks_needing_maintenance: 1,
  total_freight_today: 245000,
  estimated_profit_today: 38000,
};
const FALLBACK_ALERTS = [
  { level: 'critical', message: 'TRIP TR-001 (MH12AB1234) — 74% DELAY RISK ON NH19. RECOMMEND REROUTE VIA NH58.', action: 'SIMULATE REROUTE' },
  { level: 'warning', message: 'E-WAY BILL EW-2024-88821 ON BL-0892 EXPIRES IN 4 HOURS.', action: 'EXTEND OR EXPEDITE' },
  { level: 'info', message: 'TRUCK KA01XY9876 DUE FOR MAINTENANCE — HEALTH SCORE 58/100.', action: 'SCHEDULE MAINTENANCE' },
];

export default function Dashboard() {
  const [briefing, setBriefing] = useState(null);
  const [tripsData, setTripsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [briefingRes, tripsRes] = await Promise.all([
          api.get('/briefing/'),
          api.get('/trips/'),
        ]);
        setBriefing(briefingRes);
        setTripsData(tripsRes);
      } catch (err) {
        console.warn('Backend offline — using fallback data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const summary = briefing?.summary || FALLBACK_SUMMARY;
  const alerts = briefing?.alerts || FALLBACK_ALERTS;
  const highRisk = tripsData?.high_risk_count ?? summary.high_risk_trips;
  const activeTrips = tripsData?.total ?? summary.total_active_trips;
  const inTransit = tripsData?.in_transit_count ?? summary.total_active_trips;

  const alertBg = {
    critical: 'bg-red-50 dark:bg-red-900/20 border-l-red-500 text-red-800 dark:text-red-200',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-l-amber-500 text-amber-800 dark:text-amber-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500 text-blue-800 dark:text-blue-200',
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">

      {/* Welcome Banner */}
      <div className="pro-card bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 mb-2">
            {briefing?.copilot_tip ? 'AI BRIEFING READY' : 'SYSTEM STATUS: OPTIMAL'}
          </h1>
          <p className="text-sm tracking-widest text-emerald-700 dark:text-emerald-400 font-bold uppercase">
            {briefing?.copilot_tip || 'All fleet metrics are within normal parameters.'}
          </p>
        </div>
        <div className="hidden md:block">
          <div className="px-4 py-2 bg-emerald-600 text-white rounded text-xs tracking-widest font-bold">
            {loading ? 'SYNCING...' : 'LIVE SYNC: ACTIVE'}
          </div>
        </div>
      </div>

      {/* Stats Board */}
      <h2 className="text-xl font-bold text-slate-800 dark:text-gray-200 mb-4 tracking-widest border-b border-gray-200 dark:border-slate-700 pb-2">
        LIVE METRICS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="pro-card border-l-4 border-l-blue-500">
          <h3 className="text-slate-500 dark:text-slate-400 text-xs tracking-widest font-bold mb-1">ACTIVE TRIPS</h3>
          <p className="text-4xl font-bold text-slate-800 dark:text-white">{activeTrips}</p>
        </div>
        <div className="pro-card border-l-4 border-l-amber-500">
          <h3 className="text-slate-500 dark:text-slate-400 text-xs tracking-widest font-bold mb-1">AT RISK (WARNING)</h3>
          <p className="text-4xl font-bold text-amber-600 dark:text-amber-500">{highRisk}</p>
        </div>
        <div className="pro-card border-l-4 border-l-red-500">
          <h3 className="text-slate-500 dark:text-slate-400 text-xs tracking-widest font-bold mb-1">DELAYED (CRITICAL)</h3>
          <p className="text-4xl font-bold text-red-600 dark:text-red-500">
            {tripsData?.trips?.filter(t => t.status === 'delayed').length ?? 1}
          </p>
        </div>
        <div className="pro-card border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/10">
          <h3 className="text-emerald-700 dark:text-emerald-400 text-xs tracking-widest font-bold mb-1">EST. REVENUE TODAY</h3>
          <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">
            ₹{(summary.total_freight_today / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Fleet Diagnostics */}
        <div className="lg:col-span-2 pro-card flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200 tracking-widest">FLEET DIAGNOSTICS</h2>
            <button className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">VIEW ALL</button>
          </div>
          <div className="space-y-6 flex-1">
            {(tripsData?.trips || []).slice(0, 3).map((trip) => {
              const score = trip.delay_probability != null ? Math.round((1 - trip.delay_probability) * 100) : 80;
              const color = score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-500';
              const label = score >= 70 ? 'OPTIMAL CONDITION' : score >= 45 ? 'MAINTENANCE REQUIRED' : 'CRITICAL RISK';
              const labelColor = score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : score >= 45 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
              const borderColor = score >= 70 ? 'border-emerald-500' : score >= 45 ? 'border-amber-500' : 'border-red-500';
              return (
                <div key={trip.id} className={`flex items-center gap-6 border-l-2 ${borderColor} pl-4 py-1`}>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-800 dark:text-gray-200 tracking-wider">UNIT {trip.truck_number}</span>
                      <span className={`font-bold text-xs tracking-widest ${labelColor}`}>{label}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!tripsData && (
              <>
                <div className="flex items-center gap-6 border-l-2 border-emerald-500 pl-4 py-1">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-800 dark:text-gray-200 tracking-wider">UNIT MH12AB1234</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs tracking-widest">OPTIMAL CONDITION</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 border-l-2 border-amber-500 pl-4 py-1">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-800 dark:text-gray-200 tracking-wider">UNIT UP14CD5678</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-xs tracking-widest">MAINTENANCE REQUIRED</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* System Alerts - Now live from /briefing API */}
        <div className="pro-card flex flex-col bg-slate-50 dark:bg-slate-800/80">
          <div className="mb-4 border-b border-gray-200 dark:border-slate-700 pb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200 tracking-widest">SYSTEM ALERTS</h2>
          </div>
          <div className="flex-1 space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`border-l-4 p-3 text-xs leading-relaxed tracking-wide font-bold rounded-sm ${alertBg[alert.level] || alertBg.info}`}>
                {alert.message}
                {alert.action && (
                  <div className="mt-2 font-bold text-[10px] tracking-widest opacity-70">→ {alert.action}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Map Section */}
      <div className="mt-6 pro-card flex flex-col h-[500px] p-0 overflow-hidden bg-slate-50 dark:bg-slate-800/80">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 relative shadow-sm flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200 tracking-widest">
            LIVE TRACKING & RISK HEATMAP
          </h2>
          <div className="flex gap-4 text-xs font-bold tracking-widest">
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> ON TRACK</span>
            <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400"><div className="w-2 h-2 rounded-full bg-amber-500"></div> MAINTENANCE</span>
            <span className="flex items-center gap-2 text-red-600 dark:text-red-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> DELAYED / RISK ZONE</span>
          </div>
        </div>
        <div className="flex-1 relative z-0">
          <LiveMap />
        </div>
      </div>

    </div>
  );
}
