"use client";

import React from "react";
import { getAvatarById } from "@/lib/constants/avatars";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarId?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  animated?: boolean;
  border?: boolean;
}

const sizeClasses = {
  xs: "w-8 h-8 rounded-xl",
  sm: "w-10 h-10 rounded-2xl",
  md: "w-12 h-12 rounded-2xl",
  lg: "w-16 h-16 rounded-[1.5rem]",
  xl: "w-24 h-24 rounded-[2rem]",
  "2xl": "w-28 h-28 rounded-[2rem]",
};

export function UserAvatar({
  avatarId = "sophia",
  name = "User",
  size = "md",
  className,
  animated = true,
  border = true,
}: UserAvatarProps) {
  const avatarMeta = getAvatarById(avatarId);

  // SVG Character Renderers with normal friendly person vibes
  const renderAvatarGraphics = (id: string) => {
    switch (id) {
      case "sophia":
        // Sophia: Warm hazelnut sweater, round chic glasses, wavy espresso hair, friendly smile
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Background */}
            <circle cx="50" cy="50" r="50" fill="url(#bg-sophia)" />
            <defs>
              <linearGradient id="bg-sophia" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#C5A880" />
                <stop offset="100%" stopColor="#8C6E52" />
              </linearGradient>
            </defs>
            {/* Body / Knit Sweater */}
            <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#4A3B2C" />
            <path d="M38 68 C42 75 58 75 62 68 Z" fill="#F3D5C0" />
            {/* Gold Necklace */}
            <path d="M44 74 Q50 80 56 74" stroke="#E5C378" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Neck */}
            <rect x="44" y="52" width="12" height="18" fill="#F3D5C0" rx="4" />
            {/* Head / Face */}
            <ellipse cx="50" cy="46" rx="18" ry="21" fill="#FCDDC7" />
            {/* Wavy Hair (Back) */}
            <path d="M25 45 C20 62 30 75 32 82 C34 76 38 65 35 50 Z" fill="#2E1F16" />
            <path d="M75 45 C80 62 70 75 68 82 C66 76 62 65 65 50 Z" fill="#2E1F16" />
            {/* Cheeks */}
            <circle cx="39" cy="50" r="3.5" fill="#EFA89B" opacity="0.6" />
            <circle cx="61" cy="50" r="3.5" fill="#EFA89B" opacity="0.6" />
            {/* Eyes */}
            <circle cx="41" cy="44" r="2.2" fill="#24140D" />
            <circle cx="59" cy="44" r="2.2" fill="#24140D" />
            {/* Eyebrows */}
            <path d="M37 38 Q42 36 45 39" stroke="#2E1F16" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M55 39 Q58 36 63 38" stroke="#2E1F16" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Chic Round Glasses */}
            <circle cx="41" cy="44" r="6.5" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
            <circle cx="59" cy="44" r="6.5" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
            <path d="M47.5 44 L52.5 44" stroke="#D4AF37" strokeWidth="1.5" />
            {/* Gentle Smile */}
            <path d="M46 54 Q50 58 54 54" stroke="#9E4D4D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Hair (Front / Waves) */}
            <path d="M32 38 C32 23 45 18 50 18 C65 18 68 28 68 38 C68 28 62 25 50 25 C38 25 32 30 32 38 Z" fill="#2E1F16" />
            <path d="M32 35 C32 45 35 55 30 65 C26 50 28 35 32 35 Z" fill="#2E1F16" />
          </svg>
        );

      case "alexander":
        // Alexander: Tailored dark polo, side-parted hair, calm confident look
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-alexander)" />
            <defs>
              <linearGradient id="bg-alexander" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#385A4D" />
                <stop offset="100%" stopColor="#1B3329" />
              </linearGradient>
            </defs>
            {/* Body */}
            <path d="M20 100 C20 74 34 66 50 66 C66 66 80 74 80 100 Z" fill="#182A22" />
            {/* Polo Collar */}
            <path d="M39 66 L50 82 L61 66 L55 66 L50 74 L45 66 Z" fill="#2E4D40" />
            <rect x="44" y="50" width="12" height="18" fill="#F0CBB1" rx="4" />
            {/* Head */}
            <ellipse cx="50" cy="44" rx="17.5" ry="20" fill="#F8D9C2" />
            {/* Eyes */}
            <circle cx="42" cy="43" r="2.2" fill="#1C2621" />
            <circle cx="58" cy="43" r="2.2" fill="#1C2621" />
            {/* Eyebrows */}
            <path d="M38 37 Q42 35 46 37" stroke="#1D1A16" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M54 37 Q58 35 62 37" stroke="#1D1A16" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Smile */}
            <path d="M46 54 Q50 57 54 54" stroke="#874738" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Hair */}
            <path d="M31 38 C31 22 45 16 56 16 C68 16 69 26 69 38 C69 27 60 21 50 21 C36 21 33 28 31 38 Z" fill="#1D1A16" />
            <path d="M31 34 C31 28 42 22 55 24 C46 26 35 30 33 42 Z" fill="#2B2620" />
          </svg>
        );

      case "maya":
        // Maya: High topknot bun, aesthetic sage turtleneck, gold hoop earrings
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-maya)" />
            <defs>
              <linearGradient id="bg-maya" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#4E6C5F" />
                <stop offset="100%" stopColor="#283F35" />
              </linearGradient>
            </defs>
            {/* Bun */}
            <circle cx="50" cy="17" r="11" fill="#1F1612" />
            <path d="M46 17 Q50 12 54 17" stroke="#C5A880" strokeWidth="2" fill="none" />
            {/* Body / Turtleneck */}
            <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#213F33" />
            {/* Neck / Collar */}
            <rect x="42" y="54" width="16" height="17" fill="#2B493D" rx="6" />
            {/* Head */}
            <ellipse cx="50" cy="44" rx="17" ry="20" fill="#E8B896" />
            {/* Gold Hoop Earrings */}
            <circle cx="31" cy="48" r="4.5" stroke="#E5C378" strokeWidth="1.8" fill="none" />
            <circle cx="69" cy="48" r="4.5" stroke="#E5C378" strokeWidth="1.8" fill="none" />
            {/* Cheeks */}
            <circle cx="40" cy="49" r="3" fill="#D98270" opacity="0.5" />
            <circle cx="60" cy="49" r="3" fill="#D98270" opacity="0.5" />
            {/* Eyes */}
            <path d="M39 42 Q42 45 45 42" stroke="#1F1612" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M55 42 Q58 45 61 42" stroke="#1F1612" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Eyebrows */}
            <path d="M38 36 Q42 34 46 37" stroke="#1F1612" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M54 37 Q58 34 62 36" stroke="#1F1612" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Smile */}
            <path d="M46 52 Q50 57 54 52" stroke="#873E2E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Hair Base */}
            <path d="M32 38 C32 24 45 22 50 22 C55 22 68 24 68 38 C68 28 62 25 50 25 C38 25 32 30 32 38 Z" fill="#1F1612" />
          </svg>
        );

      case "lucas":
        // Lucas: Beanie, caramel knit sweater, soft smile
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-lucas)" />
            <defs>
              <linearGradient id="bg-lucas" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#8C6B4E" />
                <stop offset="100%" stopColor="#4A3423" />
              </linearGradient>
            </defs>
            {/* Body */}
            <path d="M20 100 C20 74 34 68 50 68 C66 68 80 74 80 100 Z" fill="#987B5E" />
            <path d="M40 68 C44 75 56 75 60 68 Z" fill="#E8C3A7" />
            <rect x="44" y="52" width="12" height="18" fill="#E8C3A7" rx="4" />
            {/* Head */}
            <ellipse cx="50" cy="46" rx="17.5" ry="20" fill="#F4D2B8" />
            {/* Eyes */}
            <circle cx="42" cy="46" r="2.2" fill="#2B2118" />
            <circle cx="58" cy="46" r="2.2" fill="#2B2118" />
            {/* Smile */}
            <path d="M46 56 Q50 60 54 56" stroke="#874738" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Beanie Hat */}
            <path d="M29 37 C29 18 43 14 50 14 C57 14 71 18 71 37 Z" fill="#213F33" />
            <rect x="27" y="32" width="46" height="9" rx="4.5" fill="#2B493D" />
            {/* Hair peeking out */}
            <path d="M31 41 Q33 46 36 43" stroke="#3D291A" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M69 41 Q67 46 64 43" stroke="#3D291A" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      case "elena":
        // Elena: Sleek bob cut, pearl pin, chic blazer
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-elena)" />
            <defs>
              <linearGradient id="bg-elena" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#A28876" />
                <stop offset="100%" stopColor="#5E4B3E" />
              </linearGradient>
            </defs>
            {/* Blazer */}
            <path d="M20 100 C20 74 34 66 50 66 C66 66 80 74 80 100 Z" fill="#1C211E" />
            <path d="M38 66 L50 90 L62 66 Z" fill="#FAF8F3" />
            <rect x="44" y="50" width="12" height="18" fill="#F8D9C2" rx="4" />
            {/* Head */}
            <ellipse cx="50" cy="44" rx="17" ry="20" fill="#F8D9C2" />
            {/* Bob Hair (Back) */}
            <path d="M28 35 C28 58 35 62 35 62 C35 62 65 62 65 62 C65 62 72 58 72 35 Z" fill="#171412" />
            {/* Eyes */}
            <circle cx="42" cy="43" r="2.2" fill="#171412" />
            <circle cx="58" cy="43" r="2.2" fill="#171412" />
            {/* Eyebrows */}
            <path d="M38 37 Q42 34 46 37" stroke="#171412" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M54 37 Q58 34 62 37" stroke="#171412" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Lip Smile */}
            <path d="M46 53 Q50 56 54 53" stroke="#A84B4B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Sleek Bob Front */}
            <path d="M30 35 C30 22 43 18 50 18 C65 18 70 26 70 35 C70 48 66 54 66 54 C66 38 62 26 50 26 C38 26 34 38 34 54 C34 54 30 48 30 35 Z" fill="#171412" />
            {/* Pearl Pin */}
            <circle cx="67" cy="36" r="3" fill="#FFFFFF" />
            <circle cx="67" cy="36" r="1.5" fill="#E8E2D8" />
          </svg>
        );

      case "liam":
        // Liam: Modern curls, dark jacket, casual friendly look
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-liam)" />
            <defs>
              <linearGradient id="bg-liam" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#2B493D" />
                <stop offset="100%" stopColor="#14261F" />
              </linearGradient>
            </defs>
            <path d="M20 100 C20 74 34 66 50 66 C66 66 80 74 80 100 Z" fill="#385A4D" />
            <path d="M42 66 C45 72 55 72 58 66 Z" fill="#E0B695" />
            <rect x="44" y="50" width="12" height="18" fill="#E0B695" rx="4" />
            <ellipse cx="50" cy="44" rx="17.5" ry="20" fill="#EDBFA1" />
            {/* Eyes */}
            <circle cx="42" cy="43" r="2.2" fill="#1F1612" />
            <circle cx="58" cy="43" r="2.2" fill="#1F1612" />
            <path d="M38 37 Q42 35 46 37" stroke="#1F1612" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M54 37 Q58 35 62 37" stroke="#1F1612" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M46 54 Q50 57 54 54" stroke="#874738" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Textured Curls */}
            <circle cx="34" cy="28" r="7" fill="#1F1612" />
            <circle cx="43" cy="22" r="8" fill="#1F1612" />
            <circle cx="53" cy="21" r="8.5" fill="#1F1612" />
            <circle cx="63" cy="25" r="7.5" fill="#1F1612" />
            <circle cx="67" cy="33" r="6" fill="#1F1612" />
            <circle cx="32" cy="34" r="6" fill="#1F1612" />
          </svg>
        );

      case "zara":
        // Zara: Voluminous curls, warm amber top, cheerful smile
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-zara)" />
            <defs>
              <linearGradient id="bg-zara" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#C5A880" />
                <stop offset="100%" stopColor="#7A583A" />
              </linearGradient>
            </defs>
            {/* Afro Curls Halo */}
            <circle cx="50" cy="42" r="28" fill="#140E0A" />
            <circle cx="30" cy="35" r="10" fill="#140E0A" />
            <circle cx="70" cy="35" r="10" fill="#140E0A" />
            <circle cx="50" cy="18" r="12" fill="#140E0A" />
            {/* Body */}
            <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#987B5E" />
            <rect x="44" y="52" width="12" height="18" fill="#AF7850" rx="4" />
            <ellipse cx="50" cy="46" rx="17" ry="19.5" fill="#BA825A" />
            <circle cx="41" cy="45" r="2.2" fill="#140E0A" />
            <circle cx="59" cy="45" r="2.2" fill="#140E0A" />
            <circle cx="38" cy="51" r="3" fill="#D97A60" opacity="0.6" />
            <circle cx="62" cy="51" r="3" fill="#D97A60" opacity="0.6" />
            {/* Cheerful Smile with teeth */}
            <path d="M45 55 Q50 61 55 55 Z" fill="#FFFFFF" stroke="#873525" strokeWidth="1.5" />
          </svg>
        );

      case "oliver":
        // Oliver: Tortoiseshell glasses, oxford shirt, scholarly look
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-oliver)" />
            <defs>
              <linearGradient id="bg-oliver" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#3D594C" />
                <stop offset="100%" stopColor="#1E332A" />
              </linearGradient>
            </defs>
            <path d="M20 100 C20 74 34 66 50 66 C66 66 80 74 80 100 Z" fill="#4E6C5F" />
            <path d="M43 66 L50 78 L57 66 Z" fill="#FAF8F3" />
            <rect x="44" y="50" width="12" height="18" fill="#F4D2B8" rx="4" />
            <ellipse cx="50" cy="44" rx="17.5" ry="20" fill="#F8DCB8" />
            {/* Square Wireframe Glasses */}
            <rect x="34" y="38" width="13" height="11" rx="2" stroke="#5C4033" strokeWidth="2" fill="none" />
            <rect x="53" y="38" width="13" height="11" rx="2" stroke="#5C4033" strokeWidth="2" fill="none" />
            <path d="M47 43 L53 43" stroke="#5C4033" strokeWidth="2" />
            <circle cx="40.5" cy="43.5" r="2" fill="#241B15" />
            <circle cx="59.5" cy="43.5" r="2" fill="#241B15" />
            <path d="M46 55 Q50 58 54 55" stroke="#874738" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Side-Swept Hair */}
            <path d="M31 36 C31 20 44 16 54 16 C67 16 68 25 68 36 C68 26 59 20 50 20 C36 20 33 26 31 36 Z" fill="#422D1D" />
          </svg>
        );

      case "chloe":
        // Chloe: Cozy oversized sweater, curtain bangs, relaxed gentle expression
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-chloe)" />
            <defs>
              <linearGradient id="bg-chloe" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#A28266" />
                <stop offset="100%" stopColor="#5E4633" />
              </linearGradient>
            </defs>
            <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#6C5B4C" />
            <rect x="44" y="52" width="12" height="18" fill="#F4D2B8" rx="4" />
            <ellipse cx="50" cy="45" rx="17.5" ry="20" fill="#FCDDC7" />
            {/* Cheeks */}
            <circle cx="39" cy="49" r="3.5" fill="#EFA89B" opacity="0.6" />
            <circle cx="61" cy="49" r="3.5" fill="#EFA89B" opacity="0.6" />
            <circle cx="41" cy="43" r="2.2" fill="#24140D" />
            <circle cx="59" cy="43" r="2.2" fill="#24140D" />
            <path d="M46 53 Q50 57 54 53" stroke="#9E4D4D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Curtain Bangs & Hair */}
            <path d="M30 40 C30 22 45 16 50 16 C65 16 70 24 70 40 C66 30 58 24 50 24 C42 24 34 30 30 40 Z" fill="#3D2617" />
            <path d="M34 25 Q42 35 36 50 Q31 38 34 25 Z" fill="#3D2617" />
            <path d="M66 25 Q58 35 64 50 Q69 38 66 25 Z" fill="#3D2617" />
          </svg>
        );

      case "noah":
        // Noah: Classic zip sweater, sharp haircut, calm focused gaze
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-noah)" />
            <defs>
              <linearGradient id="bg-noah" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#45504E" />
                <stop offset="100%" stopColor="#1E2423" />
              </linearGradient>
            </defs>
            <path d="M20 100 C20 74 34 66 50 66 C66 66 80 74 80 100 Z" fill="#212625" />
            <path d="M49 66 L50 82 L51 66 Z" stroke="#E8E2D8" strokeWidth="1.5" />
            <rect x="44" y="50" width="12" height="18" fill="#F0CBB1" rx="4" />
            <ellipse cx="50" cy="44" rx="17.5" ry="20" fill="#F8D9C2" />
            <circle cx="42" cy="43" r="2.2" fill="#1C211F" />
            <circle cx="58" cy="43" r="2.2" fill="#1C211F" />
            <path d="M38 37 Q42 34 46 37" stroke="#1C211F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M54 37 Q58 34 62 37" stroke="#1C211F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M46 54 Q50 56 54 54" stroke="#874738" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M32 36 C32 20 44 16 54 16 C66 16 68 24 68 36 C68 25 58 20 50 20 C36 20 34 26 32 36 Z" fill="#1A1C1B" />
          </svg>
        );

      case "aria":
        // Aria: Dynamic half-up hair, delicate necklace, cheerful smile
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-aria)" />
            <defs>
              <linearGradient id="bg-aria" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#A8886D" />
                <stop offset="100%" stopColor="#634B38" />
              </linearGradient>
            </defs>
            <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#7A6652" />
            <rect x="44" y="52" width="12" height="18" fill="#FCDDC7" rx="4" />
            <ellipse cx="50" cy="45" rx="17" ry="20" fill="#FCDDC7" />
            <circle cx="41" cy="44" r="2.2" fill="#24140D" />
            <circle cx="59" cy="44" r="2.2" fill="#24140D" />
            <path d="M45 54 Q50 59 55 54" stroke="#9E4D4D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M30 40 C30 20 45 16 50 16 C65 16 70 20 70 40 C70 55 64 65 64 65 C64 45 62 25 50 25 C38 25 36 45 36 65 C36 65 30 55 30 40 Z" fill="#472F1F" />
          </svg>
        );

      case "marcus":
      default:
        // Marcus: Trim beard, casual jacket, friendly wink
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="50" fill="url(#bg-marcus)" />
            <defs>
              <linearGradient id="bg-marcus" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#2E4A3E" />
                <stop offset="100%" stopColor="#14241D" />
              </linearGradient>
            </defs>
            <path d="M20 100 C20 74 34 66 50 66 C66 66 80 74 80 100 Z" fill="#213F33" />
            <rect x="44" y="50" width="12" height="18" fill="#E8C3A7" rx="4" />
            <ellipse cx="50" cy="44" rx="17.5" ry="20" fill="#F4D2B8" />
            {/* Neat Trim Beard */}
            <path d="M34 46 C34 62 43 65 50 65 C57 65 66 62 66 46 C66 54 58 60 50 60 C42 60 34 54 34 46 Z" fill="#2B1D14" />
            <circle cx="42" cy="43" r="2.2" fill="#2B1D14" />
            <circle cx="58" cy="43" r="2.2" fill="#2B1D14" />
            <path d="M38 37 Q42 35 46 37" stroke="#2B1D14" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M54 37 Q58 35 62 37" stroke="#2B1D14" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M46 54 Q50 57 54 54" stroke="#874738" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Hair */}
            <path d="M32 36 C32 20 44 16 54 16 C66 16 68 24 68 36 C68 25 58 20 50 20 C36 20 34 26 32 36 Z" fill="#2B1D14" />
          </svg>
        );
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-all duration-300",
        sizeClasses[size],
        border && "border-2 border-[#E8E2D8] dark:border-white/10",
        animated && "group-hover:scale-105",
        className
      )}
      title={`${name} (${avatarMeta.name})`}
    >
      {renderAvatarGraphics(avatarId)}
    </div>
  );
}
