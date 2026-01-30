
import React from 'react';
import { Icons } from '../constants';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  onToggle: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, isPremium, onToggle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative glass-panel w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-secondary/20">
        
        <div className="p-10 text-center border-b border-white/5 bg-gradient-to-b from-secondary/10 to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
            <h2 className="text-4xl font-bold font-display text-white mb-2 tracking-tight">Upgrade to <span className="text-secondary drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">TITAN</span></h2>
            <p className="text-text-muted text-sm max-w-md mx-auto">Unleash the full power of the Neural Engine. Designed for high-volume workshops and serious flippers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Free Tier */}
            <div className="p-8 space-y-6 bg-surface/30">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em]">Standard Core</h3>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-sm text-text">
                        <Icons.Check className="w-5 h-5 text-emerald-500" />
                        <span>Visual Diagnostics</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-text">
                        <Icons.Check className="w-5 h-5 text-emerald-500" />
                        <span>Live Market Hunter</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-text">
                        <Icons.Check className="w-5 h-5 text-emerald-500" />
                        <span>Shop Inventory & Profits</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-text">
                        <Icons.Check className="w-5 h-5 text-emerald-500" />
                        <span>Raw Data Export (CSV)</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-text opacity-30">
                        <Icons.X className="w-5 h-5" />
                        <span>Ad-Free Interface</span>
                    </li>
                </ul>
            </div>

            {/* Premium Tier */}
            <div className="p-8 bg-gradient-to-br from-secondary/5 to-primary/5 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-secondary to-primary text-white text-[10px] font-bold uppercase rounded-bl-2xl shadow-lg tracking-wider">Most Popular</div>
                <h3 className="text-sm font-bold text-secondary uppercase tracking-[0.2em] drop-shadow-sm">TITAN Access</h3>
                <ul className="space-y-4">
                     <li className="flex items-center gap-3 text-sm text-white font-medium">
                        <Icons.Check className="w-5 h-5 text-secondary" />
                        <span>Sensory Input (Audio/Video)</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-white font-medium">
                        <Icons.Check className="w-5 h-5 text-secondary" />
                        <span>Advanced Neural Analysis</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-white font-medium">
                        <Icons.Check className="w-5 h-5 text-secondary" />
                        <span>Ad-Free Workspace</span>
                    </li>
                </ul>
            </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-surface/80 flex justify-end gap-4 items-center">
            <button onClick={onClose} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors">
                Dismiss
            </button>
            <button 
                onClick={() => { onToggle(); onClose(); }}
                className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-glow-secondary bg-gradient-to-r from-secondary to-primary"
            >
                {isPremium ? 'Deactivate TITAN' : 'Activate TITAN'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
