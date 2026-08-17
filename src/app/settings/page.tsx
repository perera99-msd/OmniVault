import { getAuthenticatedUser } from "@/lib/auth/session";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { Settings as SettingsIcon, Bell, HelpCircle, ShieldAlert } from "lucide-react";
import * as motion from "framer-motion/client";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { ProfileSettingsClient } from "@/components/settings/ProfileSettingsClient";
import { SecuritySettingsClient } from "@/components/settings/SecuritySettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch {
    return null;
  }
  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FDFBF7] dark:bg-[#121412] transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-[#987B5E]/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-[#987B5E]/10 dark:bg-[#987B5E]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[35%] h-[35%] bg-[#213F33]/10 dark:bg-[#385A4D]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8 lg:space-y-12"
        >
        
          {/* Header */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-[#E8E2D8] dark:border-white/5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#181B18] shadow-sm border border-[#E8E2D8] dark:border-white/10 mb-1">
                <SettingsIcon className="w-3.5 h-3.5 text-[#987B5E]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">Vault Security & Profile</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] leading-none font-heading">
                Settings
              </h1>
              <p className="text-[#6C5B4C] dark:text-[#9A9EA4] text-sm md:text-base font-bold tracking-wide">
                Manage your credentials, biometric security, and application themes.
              </p>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Profile & Security */}
            <div className="xl:col-span-8 space-y-8">
              
              <motion.div variants={itemVariants}>
                <ProfileSettingsClient user={{ name: user.name, email: user.email, avatar: user.avatar }} />
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
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#987B5E]/10 rounded-xl text-[#987B5E]">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">Notifications</h3>
                      <p className="text-[10px] text-[#987B5E] font-black mt-0.5 uppercase tracking-widest">Coming Soon</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 opacity-50 pointer-events-none">
                  <div className="flex items-center justify-between p-5 bg-[#FAF8F3] dark:bg-[#202420] rounded-2xl border border-[#E8E2D8] dark:border-white/10">
                    <span className="text-sm font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">Push Notifications</span>
                    <div className="w-12 h-6 bg-[#213F33] rounded-full p-1 shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-6 shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-[#FAF8F3] dark:bg-[#202420] rounded-2xl border border-[#E8E2D8] dark:border-white/10">
                    <span className="text-sm font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">Email Digests</span>
                    <div className="w-12 h-6 bg-[#E8E2D8] dark:bg-[#2C2F33] rounded-full p-1 shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Support */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group cursor-pointer hover:border-[#987B5E]/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#213F33]/10 dark:bg-[#385A4D]/20 text-[#213F33] dark:text-[#4E6C5F] flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3] group-hover:text-[#987B5E] transition-colors">Help & Concierge</h4>
                    <p className="text-xs font-medium text-[#6C5B4C] dark:text-[#9A9EA4] mt-0.5">Contact the Tria Finance team.</p>
                  </div>
                </div>
              </motion.div>

              {/* Action Zone */}
              <motion.div variants={itemVariants} className="pt-2 space-y-3">
                <LogoutButton />
                <button className="w-full flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 transition-all">
                  <ShieldAlert className="w-4 h-4" /> Deactivate Vault
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
