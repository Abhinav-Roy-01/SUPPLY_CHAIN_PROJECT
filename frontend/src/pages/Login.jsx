import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(`ERROR: ${err.message || 'FAILED TO SIGN IN WITH GOOGLE'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 pro-card z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-widest border-b-2 border-emerald-600 pb-4 inline-block mx-auto w-full">
            SUPPLY CHAIN
          </h2>
          <p className="mt-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
            LOGISTICS RESILIENCE PLATFORM
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 text-center font-bold text-xs tracking-wider">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 text-sm font-bold uppercase tracking-widest rounded-md text-slate-700 dark:text-white bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            SIGN IN WITH GOOGLE
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest">OR</span>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.setItem('demo_mode', 'true');
              window.location.href = '/dashboard';
            }}
            className="pro-button w-full text-sm"
          >
            ENTER DEMO MODE
          </button>
        </div>
      </div>
    </div>
  );
}
