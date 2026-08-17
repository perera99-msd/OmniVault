export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  tag: string;
  gradient: string;
  borderAccent: string;
}

export const AVATARS: AvatarOption[] = [
  {
    id: "sophia",
    name: "Sophia",
    role: "Wealth Architect",
    tag: "Creative",
    gradient: "from-[#B89774] via-[#987B5E] to-[#6C5B4C]",
    borderAccent: "#D4B48A",
  },
  {
    id: "alexander",
    name: "Alexander",
    role: "Fund Strategist",
    tag: "Strategic",
    gradient: "from-[#385A4D] via-[#213F33] to-[#14261F]",
    borderAccent: "#4E6C5F",
  },
  {
    id: "maya",
    name: "Maya",
    role: "Portfolio Curator",
    tag: "Minimalist",
    gradient: "from-[#4E6C5F] via-[#385A4D] to-[#213F33]",
    borderAccent: "#6C7D73",
  },
  {
    id: "lucas",
    name: "Lucas",
    role: "Asset Analyst",
    tag: "Cozy Casual",
    gradient: "from-[#8C6B4E] via-[#6C5B4C] to-[#4A3D32]",
    borderAccent: "#C5A880",
  },
  {
    id: "elena",
    name: "Elena",
    role: "Executive Banker",
    tag: "Leadership",
    gradient: "from-[#987B5E] via-[#7A6652] to-[#534638]",
    borderAccent: "#D4B48A",
  },
  {
    id: "liam",
    name: "Liam",
    role: "Fintech Builder",
    tag: "Technologist",
    gradient: "from-[#2B493D] via-[#213F33] to-[#162921]",
    borderAccent: "#385A4D",
  },
  {
    id: "zara",
    name: "Zara",
    role: "Growth Advisor",
    tag: "Vibrant",
    gradient: "from-[#C5A880] via-[#987B5E] to-[#6C5B4C]",
    borderAccent: "#E8E2D8",
  },
  {
    id: "oliver",
    name: "Oliver",
    role: "Equity Researcher",
    tag: "Scholarly",
    gradient: "from-[#3D594C] via-[#283E34] to-[#17251F]",
    borderAccent: "#5C7A6D",
  },
  {
    id: "chloe",
    name: "Chloe",
    role: "Angel Investor",
    tag: "Modern",
    gradient: "from-[#A28266] via-[#7A6652] to-[#524436]",
    borderAccent: "#D4B48A",
  },
  {
    id: "noah",
    name: "Noah",
    role: "Private Banker",
    tag: "Classic",
    gradient: "from-[#45504E] via-[#2A3432] to-[#181E1D]",
    borderAccent: "#6A7775",
  },
  {
    id: "aria",
    name: "Aria",
    role: "Treasury Lead",
    tag: "Dynamic",
    gradient: "from-[#A8886D] via-[#85664E] to-[#594332]",
    borderAccent: "#D4B48A",
  },
  {
    id: "marcus",
    name: "Marcus",
    role: "Venture Partner",
    tag: "Artisan",
    gradient: "from-[#2E4A3E] via-[#1E332B] to-[#111F1A]",
    borderAccent: "#4A6E5E",
  },
];

export const DEFAULT_AVATAR_ID = "sophia";

export function getAvatarById(id?: string): AvatarOption {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}
