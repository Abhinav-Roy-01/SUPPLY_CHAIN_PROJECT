import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Simulate() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      <div className="mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-widest">WHAT-IF SIMULATION ENGINE</h1>
      </div>

      <div className="pro-card border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10 mb-8">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">TRIP BL-0892: DELHI → KANPUR</h2>
        <p className="text-xs text-blue-800 dark:text-blue-400 font-bold tracking-wider uppercase">ISSUE DETECTED: HEAVY RAIN ON NH19 CAUSING SEVERE BOTTLENECKS.</p>
      </div>

      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 tracking-widest">SELECT ACTION PLAN:</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Option A */}
        <div 
          onClick={() => setSelectedOption('A')}
          className={`pro-card cursor-pointer transition-all ${
            selectedOption === 'A' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md ring-2 ring-red-500' : 'hover:border-red-300 dark:hover:border-red-700'
          }`}
        >
          <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 tracking-wider">OPTION A<br/>CONTINUE ROUTE</h3>
          </div>
          <ul className="space-y-3 mb-6 text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400">
            <li className="flex justify-between"><span>DELAY</span><span className="text-red-600 dark:text-red-400">+3 HOURS</span></li>
            <li className="flex justify-between"><span>FUEL PENALTY</span><span>+₹800</span></li>
            <li className="flex justify-between items-center">
              <span>DELIVERY RISK</span>
              <span className="bg-red-600 text-white px-2 py-1 rounded-sm text-[10px]">HIGH</span>
            </li>
          </ul>
        </div>

        {/* Option B */}
        <div 
          onClick={() => setSelectedOption('B')}
          className={`pro-card cursor-pointer transition-all ${
            selectedOption === 'B' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md ring-2 ring-emerald-500' : 'hover:border-emerald-300 dark:hover:border-emerald-700'
          }`}
        >
          <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 tracking-wider">OPTION B<br/>REROUTE NH58</h3>
            <span className="bg-emerald-600 text-white font-bold px-2 py-1 rounded-sm text-[10px] tracking-widest">AI RECOMMENDED</span>
          </div>
          <ul className="space-y-3 mb-6 text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400">
            <li className="flex justify-between"><span>TIME SAVED</span><span className="text-emerald-600 dark:text-emerald-400">2 HOURS</span></li>
            <li className="flex justify-between"><span>TOLL PENALTY</span><span>+₹300</span></li>
            <li className="flex justify-between items-center">
              <span>DELIVERY RISK</span>
              <span className="bg-emerald-600 text-white px-2 py-1 rounded-sm text-[10px]">LOW</span>
            </li>
          </ul>
        </div>

        {/* Option C */}
        <div 
          onClick={() => setSelectedOption('C')}
          className={`pro-card cursor-pointer transition-all ${
            selectedOption === 'C' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md ring-2 ring-amber-500' : 'hover:border-amber-300 dark:hover:border-amber-700'
          }`}
        >
          <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 tracking-wider">OPTION C<br/>HOLD 4 HOURS</h3>
          </div>
          <ul className="space-y-3 mb-6 text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400">
            <li className="flex justify-between"><span>DELAY</span><span className="text-amber-600 dark:text-amber-400">+4 HOURS</span></li>
            <li className="flex justify-between"><span>FUEL PENALTY</span><span>₹0</span></li>
            <li className="flex justify-between items-center">
              <span>DELIVERY RISK</span>
              <span className="bg-amber-500 text-white px-2 py-1 rounded-sm text-[10px]">MEDIUM</span>
            </li>
          </ul>
        </div>

      </div>

      {selectedOption && (
        <div className="mt-12 flex justify-end border-t border-gray-200 dark:border-slate-700 pt-6">
          <button 
            onClick={handleAccept}
            disabled={loading}
            className="pro-button px-12 disabled:opacity-50"
          >
            {loading ? 'EXECUTING COMMAND...' : `EXECUTE OPTION ${selectedOption}`}
          </button>
        </div>
      )}

    </div>
  );
}
