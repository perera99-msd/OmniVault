import { cookies } from "next/headers";
import dbConnect from "@/lib/db/index";
import { User } from "@/models/User";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { Settings as SettingsIcon, User as UserIcon, Mail, Shield, Bell, HelpCircle, Fingerprint, Lock, ShieldAlert } from "lucide-react";
import * as motion from "framer-motion/client";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { ProfileSettingsClient } from "@/components/settings/ProfileSettingsClient";
import { SecuritySettingsClient } from "@/components/settings/SecuritySettingsClient";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) return null;

  await dbConnect();
  const user = await User.findOne({ firebaseUid }).lean();
  if (!user) return null;

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

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
              
              <motion.div variants={itemVariants}>
                <ProfileSettingsClient user={{ name: user.name, email: user.email }} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <SecuritySettingsClient user={{ email: user.email }} />
              </motion.div>

            </div>

            {/* Right Column: Preferences & Extra */}
            <div className="xl:col-span-4 space-y-8">
              
              <motion.div variants={itemVariants}>
                <ThemeSettings />
              </motion.div>

              {/* Notifications */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-zinc-200/40 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-0 bg-blue-500 transition-opacity duration-700 group-hover:opacity-10" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Notifications</h3>
                      <p className="text-xs text-blue-500 font-bold mt-1 uppercase tracking-widest">Coming Soon</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 opacity-50 pointer-events-none">
                  <div className="flex items-center justify-between p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Push Notifications</span>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-6 shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Email Alerts</span>
                    <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full p-1 shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
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
                <LogoutButton />
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
