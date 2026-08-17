"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, Mail, Check, X, Edit2, Sparkles, Camera } from "lucide-react";
import { updateUserName } from "@/actions/user";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AvatarPickerModal } from "@/components/settings/AvatarPickerModal";
import { useAppStore } from "@/lib/store/useStore";
import { getAvatarById } from "@/lib/constants/avatars";

interface ProfileProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function ProfileSettingsClient({ user }: ProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.name);
  const [isLoading, setIsLoading] = useState(false);

  const storeAvatar = useAppStore((state) => state.userAvatar);
  const setStoreAvatar = useAppStore((state) => state.setUserAvatar);

  const [currentAvatar, setCurrentAvatar] = useState(user.avatar || storeAvatar || "sophia");

  useEffect(() => {
    if (user.avatar) {
      setCurrentAvatar(user.avatar);
      setStoreAvatar(user.avatar);
    }
  }, [user.avatar, setStoreAvatar]);

  const activeAvatarMeta = getAvatarById(currentAvatar);

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
    <div className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
      <h3 className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] mb-8 flex items-center gap-3 font-heading">
        <div className="p-2.5 bg-[#FAF8F3] dark:bg-[#202420] rounded-xl border border-[#E8E2D8] dark:border-white/5 text-[#987B5E]">
          <UserIcon className="w-5 h-5" />
        </div>
        Personal Information
      </h3>

      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
        {/* Interactive Avatar Area */}
        <div className="flex flex-col items-center gap-3">
          <AvatarPickerModal
            currentAvatarId={currentAvatar}
            onAvatarSaved={(newId) => setCurrentAvatar(newId)}
            trigger={
              <button
                type="button"
                className="relative group cursor-pointer rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-[#987B5E]/30 transition-all"
                title="Click to change avatar"
              >
                <UserAvatar
                  avatarId={currentAvatar}
                  name={user.name}
                  size="2xl"
                  className="shadow-md border-2 border-[#987B5E]/40 group-hover:border-[#987B5E] transition-all"
                />
                <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                  <Camera className="w-6 h-6 mb-1 text-[#EBE8E3]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Change</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-[#202420] rounded-xl flex items-center justify-center shadow-md border border-[#E8E2D8] dark:border-white/10 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 text-[#987B5E]" />
                </div>
              </button>
            }
          />
          <div className="text-center">
            <span className="text-xs font-black text-[#1A1D1A] dark:text-[#EBE8E3] block">
              {activeAvatarMeta.name}
            </span>
            <span className="text-[10px] font-semibold text-[#6C5B4C] dark:text-[#9A9EA4]">
              {activeAvatarMeta.role}
            </span>
          </div>
        </div>
        
        {/* Details Form Area */}
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest ml-1 block">Full Name</label>
              
              {!isEditingName ? (
                <div className="w-full h-14 bg-[#FAF8F3] dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] rounded-2xl px-5 flex items-center justify-between font-bold shadow-sm transition-colors hover:border-[#987B5E]/50">
                  <span className="truncate">{user.name}</span>
                  <button onClick={() => setIsEditingName(true)} className="p-1.5 text-[#6C5B4C] hover:text-[#987B5E] transition-colors" title="Edit name">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="w-full h-14 bg-white dark:bg-[#202420] border-2 border-[#987B5E] focus:outline-none focus:ring-4 focus:ring-[#987B5E]/20 text-[#1A1D1A] dark:text-[#EBE8E3] rounded-2xl px-5 font-bold shadow-sm transition-all"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button onClick={handleSaveName} disabled={isLoading} className="h-14 px-4 btn-tria-primary text-white rounded-2xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#D4B48A]" />
                  </button>
                  <button onClick={() => { setIsEditingName(false); setNameValue(user.name); }} disabled={isLoading} className="h-14 px-4 bg-[#FAF8F3] dark:bg-[#202420] hover:bg-[#EFE9E0] dark:hover:bg-[#272D27] text-[#6C5B4C] dark:text-[#9A9EA4] rounded-2xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center border border-[#E8E2D8] dark:border-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest ml-1 block">Email Address</label>
              <div className="w-full h-14 bg-[#FAF8F3] dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#6C5B4C] dark:text-[#9A9EA4] rounded-2xl px-5 flex items-center font-bold overflow-hidden text-ellipsis shadow-sm cursor-not-allowed">
                <Mail className="w-4 h-4 mr-3 text-[#987B5E]" />
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
