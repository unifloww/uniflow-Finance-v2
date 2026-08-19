import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Save, Plus, Trash2 } from "lucide-react";

export function AdminPricing() {
  const [plans, setPlans] = useState([
    {
      id: '1_month',
      title: 'Uniflow PRO (1 Bulan)',
      price: 23000,
      originalPrice: 45000,
      discountLabel: 'Promo Terbatas',
      periodLabel: '/ 1 bulan',
      features: [
        'Jumlah Akun Tak Terbatas', 'Perencanaan Anggaran',
        'Analisis Visual Dasar', 'Pencadangan Cloud'
      ]
    },
    {
      id: '1_year',
      title: 'Uniflow PRO (1 Tahun)',
      price: 85000,
      originalPrice: 850000,
      discountLabel: 'Hemat 90%',
      periodLabel: '/ 12 bulan',
      features: [
        'Jumlah Akun & Kategori Bebas', 'Perencanaan Anggaran Lengkap',
        'Manajemen Tabungan Premium', 'Analisis Visual Mendalam',
        'Kemampuan Ekspor Excel'
      ]
    },
    {
      id: 'lifetime',
      title: 'Uniflow PRO (Selamanya)',
      price: 150000,
      originalPrice: 1500000,
      discountLabel: 'Hemat 90%',
      periodLabel: 'Sekali Bayar',
      features: [
        'Semua Fitur Tanpa Batas', 'Akses Seumur Hidup',
        'Manajemen Tabungan Premium', 'Analisis Visual Mendalam',
        'Prioritas Update Sistem Baru'
      ]
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('uniflow_pricing_plans');
    if (saved) {
      try {
        setPlans(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('uniflow_pricing_plans', JSON.stringify(plans));
    window.dispatchEvent(new Event('storage'));
    alert('Pengaturan harga berhasil disimpan!');
  };

  const updatePlan = (index: number, field: string, value: any) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlans(newPlans);
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const newPlans = [...plans];
    const newFeatures = [...newPlans[planIndex].features];
    newFeatures[featureIndex] = value;
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    setPlans(newPlans);
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...plans];
    const newFeatures = [...newPlans[planIndex].features, 'Fitur baru'];
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    setPlans(newPlans);
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...plans];
    const newFeatures = [...newPlans[planIndex].features];
    newFeatures.splice(featureIndex, 1);
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    setPlans(newPlans);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Pengaturan Harga & Paket
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1">
            Ubah harga dan fitur paket langganan yang tampil di Landing Page.
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-white text-[#059669] px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors shadow-lg"
        >
          <Save className="w-5 h-5" /> Simpan Perubahan
        </button>
      </div>

      <div className="grid xl:grid-cols-3 gap-8">
        {plans.map((plan, pIdx) => (
          <Card key={plan.id} className="rounded-[2rem] border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">
                Paket: {plan.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Paket</label>
                  <input type="text" value={plan.title} onChange={(e) => updatePlan(pIdx, 'title', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#059669]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Harga Promo (Rp)</label>
                    <input type="number" value={plan.price} onChange={(e) => updatePlan(pIdx, 'price', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#059669]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Harga Coret (Rp)</label>
                    <input type="number" value={plan.originalPrice} onChange={(e) => updatePlan(pIdx, 'originalPrice', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#059669]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Label Promo</label>
                    <input type="text" value={plan.discountLabel} onChange={(e) => updatePlan(pIdx, 'discountLabel', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#059669]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Periode Aktif</label>
                    <input type="text" value={plan.periodLabel} onChange={(e) => updatePlan(pIdx, 'periodLabel', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#059669]" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Fitur Paket</label>
                  <button onClick={() => addFeature(pIdx)} className="text-[#059669] hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
                <div className="space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={feature} 
                        onChange={(e) => updateFeature(pIdx, fIdx, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#059669] focus:bg-white dark:focus:bg-slate-900 transition-colors"
                      />
                      <button onClick={() => removeFeature(pIdx, fIdx)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
