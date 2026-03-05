import React from 'react';
import { Settings } from 'lucide-react';
import { SiteSettings } from './types';

interface AdminDashboardProps {
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
  onSaveSettings: () => void;
}

export default function AdminDashboard({
  siteSettings,
  setSiteSettings,
  onSaveSettings
}: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 rounded-[3rem] p-4 lg:p-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-indigo-950">Global Configuration</h3>
              <p className="text-slate-400 font-bold text-sm">Control every aspect of your platform</p>
            </div>
          </div>
          <button 
            onClick={onSaveSettings}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:scale-105 transition-all"
          >
            Save Changes
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Site Name</label>
            <input value={siteSettings.siteName} onChange={e => setSiteSettings({...siteSettings, siteName: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Site Logo URL</label>
            <input value={siteSettings.siteLogo} onChange={e => setSiteSettings({...siteSettings, siteLogo: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>
          
          {/* Links */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
            <input value={siteSettings.whatsapp} onChange={e => setSiteSettings({...siteSettings, whatsapp: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telegram</label>
            <input value={siteSettings.telegram} onChange={e => setSiteSettings({...siteSettings, telegram: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">App Download Link</label>
            <input value={siteSettings.appLink || ''} onChange={e => setSiteSettings({...siteSettings, appLink: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">YouTube Video ID</label>
            <input value={siteSettings.youtube} onChange={e => setSiteSettings({...siteSettings, youtube: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>

          {/* Payment Info */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">bKash Number</label>
            <input value={siteSettings.bkashNumber} onChange={e => setSiteSettings({...siteSettings, bkashNumber: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nagad Number</label>
            <input value={siteSettings.nagadNumber} onChange={e => setSiteSettings({...siteSettings, nagadNumber: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rocket Number</label>
            <input value={siteSettings.rocketNumber} onChange={e => setSiteSettings({...siteSettings, rocketNumber: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Upay Number</label>
            <input value={siteSettings.upayNumber || ''} onChange={e => setSiteSettings({...siteSettings, upayNumber: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
          </div>

          {/* Notice */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notice Bar Content</label>
            <textarea value={siteSettings.notice} onChange={e => setSiteSettings({...siteSettings, notice: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" rows={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
