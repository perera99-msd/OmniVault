"use client";

import { useState } from "react";
import { User as UserIcon, Mail, Check, X, Edit2 } from "lucide-react";
import { updateUserName } from "@/actions/user";

interface ProfileProps {
  user: {
    name: string;
    email: string;
  };
}

export function ProfileSettingsClient({ user }: ProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.name);
  const [isLoading, setIsLoading] = useState(false);

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const handleSaveName = async () => {
    if (nameValue.trim() === user.name) {
      setIsEditingName(false);
      return;
    }
    
    setIsLoading(true);
    const res = await updateUserName(nameValue);
    setIsLoading(false);
    
    if (res.success) {
      setIsEditingName(false);
    } else {
      alert(res.error || "Failed to update name");
    }
  };

  return (
    <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-0 bg-emerald-500 transition-opacity duration-700 group-hover:opacity-10" />
      
      <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
          <UserIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        Personal Information
      </h3>

      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
        <div className="w-28 h-28 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white text-4xl font-black shadow-inner shadow-white/20 flex-shrink-0 relative">
          {getInitials(user.name)}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-lg border border-zinc-100 dark:border-zinc-700">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
        </div>
        
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1 block">Full Name</label>
              
              {!isEditingName ? (
                <div className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl px-5 flex items-center justify-between font-bold shadow-sm transition-colors hover:border-emerald-500/30">
                  <span className="truncate">{user.name}</span>
                  <button onClick={() => setIsEditingName(true)} className="p-1.5 text-zinc-400 hover:text-emerald-500 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="w-full h-14 bg-white dark:bg-zinc-900 border-2 border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-zinc-900 dark:text-white rounded-2xl px-5 font-bold shadow-sm transition-all"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button onClick={handleSaveName} disabled={isLoading} className="h-14 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setIsEditingName(false); setNameValue(user.name); }} disabled={isLoading} className="h-14 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-2xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1 block">Email Address</label>
              <div className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl px-5 flex items-center font-bold overflow-hidden text-ellipsis shadow-sm cursor-not-allowed">
                <Mail className="w-4 h-4 mr-3 text-zinc-400" />
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
