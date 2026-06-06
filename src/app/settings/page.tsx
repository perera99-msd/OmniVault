import { cookies } from "next/headers";
import dbConnect from "@/lib/db/index";
import { User } from "@/models/User";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { Settings as SettingsIcon, User as UserIcon, Mail, Shield, Bell, HelpCircle, Fingerprint, Lock, ShieldAlert } from "lucide-react";
import * as motion from "framer-motion/client";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) return null;

  await dbConnect();
  const user = await User.findOne({ firebaseUid }).lean();
  if (!user) return null;

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-[#09090b] transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[35%] h-[35%] bg-orange-500/10 dark:bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8 lg:space-y-12"
        >
        
          {/* Header */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                <SettingsIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Preferences</span>
              </div>
              <h1 className="text-[3.5rem] md:text-[4.5rem] font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                Settings
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-bold tracking-wide">
                Manage your profile, preferences, and account security.
              </p>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Profile & Security */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Profile Card */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-zinc-200/40 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-0 bg-emerald-500 transition-opacity duration-700 group-hover:opacity-10" />
                
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
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
                        <div className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl px-5 flex items-center font-bold shadow-sm">
                          {user.name}
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1 block">Email Address</label>
                        <div className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl px-5 flex items-center font-bold overflow-hidden text-ellipsis shadow-sm">
                          <Mail className="w-4 h-4 mr-3 text-zinc-400" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Security Section */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-zinc-200/40 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-0 bg-orange-500 transition-opacity duration-700 group-hover:opacity-10" />

                <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                    <Shield className="w-5 h-5 text-orange-500" />
                  </div>
                  Account Security
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-orange-500/30">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                        <Fingerprint className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">Biometric Authentication</h4>
                        <p className="text-xs text-zinc-500 font-medium mt-1">Require Face ID / Touch ID when opening the app.</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-6 shadow-sm transition-transform" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-orange-500/30">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                        <Lock className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">Change Password</h4>
                        <p className="text-xs text-zinc-500 font-medium mt-1">Managed securely via Firebase Auth.</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95">
                      Update
                    </button>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Preferences & Extra */}
            <div className="xl:col-span-4 space-y-8">
              
              <motion.div variants={itemVariants}>
                <ThemeSettings />
              </motion.div>

              {/* Notifications */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/40 dark:shadow-none flex flex-col gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                    <Bell className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Notifications</h3>
                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Manage Alerts</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Push Notifications</span>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-6 shadow-sm transition-transform" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Email Alerts</span>
                    <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full p-1 cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white dark:bg-zinc-400 rounded-full shadow-sm transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Support */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/40 dark:shadow-none flex items-center justify-between group cursor-pointer hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">Help & Support</h4>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">Contact the OmniVault team.</p>
                  </div>
                </div>
              </motion.div>

              {/* Danger Zone */}
              <motion.div variants={itemVariants} className="pt-2">
                <button className="w-full flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-500 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all">
                  <ShieldAlert className="w-4 h-4" /> Delete Account
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
