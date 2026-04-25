import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bilty from './pages/Bilty';
import Challan from './pages/Challan';
import Trips from './pages/Trips';
import Copilot from './pages/Copilot';
import Simulate from './pages/Simulate';
import SidebarLayout from './components/SidebarLayout';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('demo_mode') === 'true') {
      setUser({ email: 'demo-operator@supplychain.com', uid: 'demo-123' });
      setLoading(false);
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* Authenticated Routes with Sidebar */}
        <Route element={user ? <SidebarLayout /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bilty" element={<Bilty />} />
          <Route path="/challan" element={<Challan />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/copilot" element={<Copilot />} />
          <Route path="/simulate" element={<Simulate />} />
        </Route>

        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
