import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Challan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    truckNo: '',
    driverName: '',
    licenseNo: '',
    biltyRef: '',
    freightTotal: '',
    advancePaid: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const freight = parseFloat(formData.freightTotal) || 0;
  const advance = parseFloat(formData.advancePaid) || 0;
  const balance = freight - advance;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('CHALLAN GENERATED SUCCESSFULLY!');
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-widest">GENERATE DELIVERY CHALLAN</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="pro-card space-y-6">
            
            <div>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 tracking-widest border-b border-gray-100 dark:border-slate-700 pb-2">VEHICLE & DRIVER DETAILS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">TRUCK NUMBER</label>
                  <input type="text" name="truckNo" value={formData.truckNo} onChange={handleChange} required className="pro-input uppercase" placeholder="e.g. MH 12 AB 1234" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">BILTY REFERENCE</label>
                  <input type="text" name="biltyRef" value={formData.biltyRef} onChange={handleChange} required className="pro-input uppercase" placeholder="LR-1004" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">DRIVER NAME</label>
                  <input type="text" name="driverName" value={formData.driverName} onChange={handleChange} required className="pro-input uppercase" placeholder="FULL NAME" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">LICENSE NUMBER</label>
                  <input type="text" name="licenseNo" value={formData.licenseNo} onChange={handleChange} className="pro-input uppercase" placeholder="DL-14-..." />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 tracking-widest border-b border-gray-100 dark:border-slate-700 pb-2">FREIGHT & PAYMENTS (₹)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">TOTAL FREIGHT</label>
                  <input type="number" name="freightTotal" value={formData.freightTotal} onChange={handleChange} required min="0" className="pro-input" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">ADVANCE PAID</label>
                  <input type="number" name="advancePaid" value={formData.advancePaid} onChange={handleChange} required min="0" className="pro-input" placeholder="0.00" />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="pro-card sticky top-6 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="text-sm font-bold text-slate-800 dark:text-gray-200 mb-6 tracking-widest border-b border-gray-200 dark:border-slate-700 pb-2">CHALLAN SUMMARY</h2>
            
            <ul className="space-y-4 mb-8 text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400">
              <li className="flex justify-between items-center">
                <span>TOTAL FREIGHT</span>
                <span className="text-slate-800 dark:text-gray-200">₹ {freight.toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center">
                <span>LESS: ADVANCE</span>
                <span className="text-red-600 dark:text-red-400">- ₹ {advance.toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-700 text-sm">
                <span className="text-slate-900 dark:text-white">BALANCE DUE</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹ {balance.toFixed(2)}</span>
              </li>
            </ul>

            <button 
              onClick={handleSubmit}
              disabled={isGenerating || !formData.truckNo || !formData.freightTotal}
              className="pro-button w-full disabled:opacity-50"
            >
              {isGenerating ? 'PROCESSING...' : 'GENERATE OFFICIAL CHALLAN'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
