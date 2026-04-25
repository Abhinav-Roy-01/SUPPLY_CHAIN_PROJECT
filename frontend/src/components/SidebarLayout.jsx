import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function SidebarLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = async () => {
    if (localStorage.getItem('demo_mode') === 'true') {
      localStorage.removeItem('demo_mode');
      navigate('/login');
      return;
    }
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'DASHBOARD' },
    { path: '/bilty', label: 'CREATE BILTY' },
    { path: '/challan', label: 'GENERATE CHALLAN' },
    { path: '/trips', label: 'LIVE TRIPS' },
    { path: '/copilot', label: 'AI COPILOT' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-900 text-emerald-50 min-h-screen flex flex-col justify-between shadow-xl z-20">
        <div>
          <div className="p-6 border-b border-emerald-800">
            <h1 className="text-2xl font-bold tracking-widest text-white leading-tight">
              SUPPLY CHAIN<br/>COMMAND
            </h1>
          </div>
          
          <nav className="mt-6 flex flex-col">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-6 py-4 text-sm tracking-widest font-bold transition-all border-l-4
                    ${isActive 
                      ? 'bg-emerald-800 border-white text-white' 
                      : 'border-transparent text-emerald-300 hover:bg-emerald-800 hover:text-white'
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-emerald-800 space-y-4">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-full bg-emerald-800 text-white font-bold tracking-widest py-3 px-4 rounded hover:bg-emerald-700 transition-colors text-sm flex justify-between items-center"
          >
            <span>THEME:</span> <span>{isDark ? 'DARK' : 'LIGHT'}</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full bg-red-700 text-white font-bold tracking-widest py-3 px-4 rounded hover:bg-red-600 transition-colors text-sm"
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-8 py-6 flex justify-between items-center shadow-sm z-10 transition-colors duration-200">
          <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 tracking-wider">
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'WELCOME'}
          </h2>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-600 transition-colors duration-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-bold text-slate-700 dark:text-gray-300 tracking-widest">OPERATOR MODE</span>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
