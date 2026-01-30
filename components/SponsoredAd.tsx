
import React from 'react';

export const SponsoredAd: React.FC = () => {
  const ads = [
    {
        title: "iFixit Pro Tech Toolkit",
        desc: "Everything you need to fix your electronics.",
        cta: "Shop Deal",
        color: "from-blue-600 to-blue-400"
    },
    {
        title: "Hakko FX-888D Station",
        desc: "The gold standard in soldering reliability.",
        cta: "View Price",
        color: "from-orange-500 to-amber-500"
    },
    {
        title: "Sell Broken Tech",
        desc: "Get cash for your broken devices today.",
        cta: "Get Quote",
        color: "from-emerald-600 to-green-500"
    }
  ];

  // Randomize ad
  const ad = ads[Math.floor(Math.random() * ads.length)];

  return (
    <div className="group relative rounded-2xl overflow-hidden mt-4 cursor-pointer">
        <div className={`absolute inset-0 bg-gradient-to-br ${ad.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/20 rounded text-[9px] font-bold text-text-muted uppercase tracking-wider">Ad</div>
        
        <div className="p-4 relative z-10">
            <h4 className="font-bold text-sm text-white mb-1">{ad.title}</h4>
            <p className="text-xs text-text-muted mb-3">{ad.desc}</p>
            <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                {ad.cta}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
        </div>
        
        {/* Shine effect */}
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
    </div>
  );
};
