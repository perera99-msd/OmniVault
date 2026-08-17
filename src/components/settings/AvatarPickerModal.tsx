"use client";

import { useState } from "react";
import { AVATARS, AvatarOption, getAvatarById } from "@/lib/constants/avatars";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { updateUserAvatar } from "@/actions/user";
import { useAppStore } from "@/lib/store/useStore";
import { toast } from "sonner";
import { Check, Sparkles, User, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AvatarPickerModalProps {
  currentAvatarId?: string;
  onAvatarSaved?: (avatarId: string) => void;
  trigger?: React.ReactNode;
}

export function AvatarPickerModal({
  currentAvatarId = "sophia",
  onAvatarSaved,
  trigger,
}: AvatarPickerModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(currentAvatarId);
  const [loading, setLoading] = useState(false);
  const setStoreAvatar = useAppStore((state) => state.setUserAvatar);

  const selectedMeta = getAvatarById(selectedId);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateUserAvatar(selectedId);
      if (res.success) {
        setStoreAvatar(selectedId);
        if (onAvatarSaved) onAvatarSaved(selectedId);
        toast.success("Avatar updated successfully!", {
          description: `You are now represented as ${selectedMeta.name}.`,
        });
        setOpen(false);
      } else {
        toast.error("Failed to update avatar", { description: res.error });
      }
    } catch (err: any) {
      toast.error("An error occurred while updating avatar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) setSelectedId(currentAvatarId || "sophia");
    }}>
      <DialogTrigger render={
        trigger ? (
          trigger as any
        ) : (
          <button
            type="button"
            className="text-xs font-bold text-[#987B5E] hover:underline"
          >
            Change Avatar
          </button>
        )
      } />

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl">
        <DialogHeader className="mb-4 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#987B5E]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">
              Identity & Persona
            </span>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">
            Choose Your Avatar
          </DialogTitle>
          <p className="text-xs sm:text-sm font-medium text-[#6C5B4C] dark:text-[#9A9EA4]">
            Select an illustrated persona to represent your vault profile.
          </p>
        </DialogHeader>

        {/* Selected Preview Highlight */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 shadow-sm mb-6">
          <UserAvatar avatarId={selectedId} size="lg" className="border-2 border-[#987B5E]/50" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-black text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">
                {selectedMeta.name}
              </h4>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#987B5E]/15 text-[#987B5E] dark:text-[#D4B48A]">
                {selectedMeta.tag}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#6C5B4C] dark:text-[#9A9EA4]">
              {selectedMeta.role}
            </p>
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {AVATARS.map((avatar) => {
            const isSelected = selectedId === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedId(avatar.id)}
                className={`relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300 group border ${
                  isSelected
                    ? "bg-white dark:bg-[#202420] border-[#987B5E] ring-2 ring-[#987B5E]/30 shadow-md scale-[1.02]"
                    : "bg-[#FAF8F3] dark:bg-[#1C201C] border-[#E8E2D8] dark:border-white/5 hover:border-[#987B5E]/40 hover:bg-white dark:hover:bg-[#242A24]"
                }`}
              >
                <div className="relative mb-2">
                  <UserAvatar avatarId={avatar.id} size="md" className="transition-transform group-hover:scale-105" />
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#213F33] dark:bg-[#4E6C5F] text-[#FDFBF7] flex items-center justify-center shadow-md border-2 border-white dark:border-[#181B18]">
                      <Check className="w-3 h-3 text-[#D4B48A]" />
                    </div>
                  )}
                </div>
                <span className={`text-xs font-black truncate w-full text-center ${isSelected ? "text-[#1A1D1A] dark:text-[#EBE8E3]" : "text-[#6C5B4C] dark:text-[#9A9EA4]"}`}>
                  {avatar.name}
                </span>
                <span className="text-[9px] text-[#6C5B4C]/70 dark:text-[#9A9EA4]/70 font-medium truncate w-full text-center">
                  {avatar.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D8] dark:border-white/10">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#6C5B4C] hover:bg-[#FAF8F3] dark:hover:bg-[#202420] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-black text-xs btn-tria-primary text-white shadow-md transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#D4B48A]" /> Apply Avatar
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
