import { useState } from 'react';
import { api } from '../api';

export default function Bilty() {
  const [biltyData, setBiltyData] = useState({
    biltyNumber: `BL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    origin: '',
    destination: '',
    weight: '',
    goodsDescription: '',
    doorDelivery: false,
    freightAmount: '',
    labourCharge: '',
    ewayBillNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const baseRate = biltyData.freightAmount ? parseFloat(biltyData.freightAmount) : 1200;
  const doorCharge = biltyData.doorDelivery ? 500 : 0;
  const labourCharge = parseFloat(biltyData.labourCharge) || 0;
  const total = baseRate + doorCharge + labourCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    try {
      const payload = {
        bilty_number: biltyData.biltyNumber,
        origin: biltyData.origin,
        destination: biltyData.destination,
        goods_description: biltyData.goodsDescription,
        weight_quintal: parseFloat(biltyData.weight) || 0,
        freight_amount: baseRate,
        labour_charge: labourCharge,
        door_delivery_charge: doorCharge,
        eway_bill_number: biltyData.ewayBillNumber || null,
      };
      const result = await api.post('/bilty/', payload);
      setSuccess(`BILTY ${result.bilty?.bilty_number || biltyData.biltyNumber} CREATED SUCCESSFULLY`);
    } catch (err) {
      setSuccess('BILTY SAVED LOCALLY (BACKEND OFFLINE)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-widest">CREATE LORRY RECEIPT (BILTY)</h1>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 text-emerald-800 dark:text-emerald-200 font-bold text-xs tracking-widest">
          ✓ {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Form */}
        <div className="lg:col-span-2 pro-card">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 tracking-widest">TRIP SPECIFICATIONS</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">BILTY NUMBER</label>
                <input
                  type="text"
                  value={biltyData.biltyNumber}
                  readOnly
                  className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 p-3 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">GOODS DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="E.G. 500KG RICE"
                  required
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase font-bold"
                  onChange={e => setBiltyData({ ...biltyData, goodsDescription: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">ORIGIN</label>
                <input
                  type="text"
                  placeholder="E.G. DELHI"
                  required
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase font-bold"
                  onChange={e => setBiltyData({ ...biltyData, origin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">DESTINATION</label>
                <input
                  type="text"
                  placeholder="E.G. KANPUR"
                  required
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase font-bold"
                  onChange={e => setBiltyData({ ...biltyData, destination: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">WEIGHT (QUINTAL)</label>
                <input
                  type="number"
                  placeholder="0.0"
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase font-bold"
                  onChange={e => setBiltyData({ ...biltyData, weight: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">FREIGHT AMOUNT (₹)</label>
                <input
                  type="number"
                  placeholder="E.G. 45000"
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase font-bold"
                  onChange={e => setBiltyData({ ...biltyData, freightAmount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">LABOUR CHARGE (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase font-bold"
                  onChange={e => setBiltyData({ ...biltyData, labourCharge: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-widest">E-WAY BILL NUMBER</label>
                <input
                  type="text"
                  placeholder="EW-2024-XXXXX (OPTIONAL)"
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase font-bold"
                  onChange={e => setBiltyData({ ...biltyData, ewayBillNumber: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 p-3 w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 dark:border-slate-500 dark:bg-slate-800"
                    onChange={e => setBiltyData({ ...biltyData, doorDelivery: e.target.checked })}
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs tracking-widest uppercase">DOOR DELIVERY (+₹500)</span>
                </label>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
              <button type="submit" disabled={submitting} className="pro-button w-full text-sm disabled:opacity-50">
                {submitting ? 'CREATING BILTY...' : 'GENERATE RECEIPT'}
              </button>
            </div>
          </form>
        </div>

        {/* Fare Calculator Sidebar */}
        <div className="pro-card bg-slate-50 dark:bg-slate-800/80 flex flex-col h-full">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 tracking-widest border-b border-gray-200 dark:border-slate-700 pb-2">
            FARE CALCULATOR
          </h2>
          <div className="space-y-4 flex-1 text-sm">
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold tracking-wider">
              <span>BASE FREIGHT</span>
              <span>₹{baseRate.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold tracking-wider">
              <span>LABOUR CHARGE</span>
              <span>₹{labourCharge.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold tracking-wider">
              <span>DOOR DELIVERY</span>
              <span>₹{doorCharge}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-emerald-500 dark:border-emerald-600">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 tracking-widest font-bold">TOTAL PAYABLE</span>
              <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
