import { useState } from 'react';
import axios from 'axios';

export default function Copilot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'HELLO. I AM SUPPLY_CHAIN_PROJECT COPILOT. HOW CAN I ASSIST YOU WITH FLEET MANAGEMENT TODAY?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input.toUpperCase() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/v1/copilot/query', {
        question: userMsg.text,
        context: {
          active_trips: 5,
          high_risk_trips: 2,
          eway_expiring: 1,
        }
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response.toUpperCase() }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'SYSTEM ERROR: CONNECTION TO BACKEND AI ENGINE FAILED. PLEASE START THE FASTAPI SERVER ON PORT 8000.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col pb-6">
      <div className="mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-widest">AI COPILOT</h1>
      </div>

      <div className="flex-1 pro-card flex flex-col overflow-hidden p-0">
        
        <div className="bg-gray-100 dark:bg-slate-700/50 p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <span className="font-bold text-slate-700 dark:text-slate-300 text-xs tracking-widest">SECURE CHAT CHANNEL</span>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-sm tracking-widest font-bold">ONLINE</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-800">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 text-xs tracking-wider font-bold leading-relaxed rounded-md ${
                msg.role === 'user' 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-gray-100 border border-gray-200 dark:border-slate-600'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 p-4 rounded-md text-xs tracking-widest font-bold animate-pulse">
                PROCESSING QUERY...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-100 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER QUERY REGARDING DELAYS, WEATHER, OR ROUTES..."
              className="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-3 text-slate-900 dark:text-white text-xs font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="pro-button text-xs px-8 disabled:opacity-50"
            >
              TRANSMIT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
