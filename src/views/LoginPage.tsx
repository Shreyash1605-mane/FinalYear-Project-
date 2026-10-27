import React, { useState } from 'react';
import { useAmbulance } from '../context/AmbulanceContext';
import { Stethoscope, Lock, Mail, Building2, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginDoctor } = useAmbulance();

  const [email, setEmail] = useState('dr.rahul.sharma@hospital.org');
  const [password, setPassword] = useState('••••••••••••');
  const [department, setDepartment] = useState('Cardiology & Emergency Response');
  const [hospital, setHospital] = useState('St. Jude General Hospital ER');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginDoctor(email, password, department);
  };

  const handleQuickDemoLogin = (doctorEmail: string, doctorDept: string) => {
    loginDoctor(doctorEmail, 'demo123', doctorDept);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#090d19] flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Glow background effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur-xl relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mb-2">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Physician & Specialist Portal</h1>
          <p className="text-xs text-slate-400">Smart Emergency Ambulance Telemetry Network Access</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email / ID Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Doctor Email / Hospital ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.name@hospital.org"
                className="w-full bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Hospital Department Dropdown */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Medical Department</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Cardiology & Emergency Response">Cardiology & Emergency Response</option>
                <option value="Trauma & Critical Intensive Care">Trauma & Critical Intensive Care (ICU)</option>
                <option value="Neurology Emergency Unit">Neurology Emergency Unit</option>
                <option value="General Emergency Services">General Emergency Services</option>
              </select>
            </div>
          </div>

          {/* Hospital Network */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Hospital Gateway Network</label>
            <select
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="St. Jude General Hospital ER">St. Jude General Hospital ER Gateway</option>
              <option value="City Central Trauma Center">City Central Trauma Center Gateway</option>
              <option value="Metropolitan Emergency ICU">Metropolitan Emergency ICU Network</option>
            </select>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-blue-500 w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span>Remember Doctor Credentials</span>
            </label>
            <a href="#" className="text-blue-400 hover:underline text-[11px]">Forgot Access Code?</a>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/40 cursor-pointer mt-2"
          >
            <span>Authorize & Launch Telemetry Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold block text-center">Quick Physician Login Presets:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('dr.rahul.sharma@hospital.org', 'Cardiology & ER')}
              className="bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/60 p-2 rounded-lg text-[11px] font-medium flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dr. Rahul Sharma</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('dr.ananya.sen@hospital.org', 'Trauma ICU')}
              className="bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/60 p-2 rounded-lg text-[11px] font-medium flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dr. Ananya Sen</span>
            </button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit Encrypted HIPAA Medical Telemetry Gateway</span>
        </div>
      </div>
    </div>
  );
};
