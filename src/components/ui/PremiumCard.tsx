import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-[#1e1e1e]/70 backdrop-blur-2xl border border-[#e8e0dc]/80 dark:border-[#333333]/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
};
