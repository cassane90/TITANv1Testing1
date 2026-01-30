
import React from 'react';
import { QueryRecord } from '../types';
import { formatCurrency, Icons } from '../constants';

interface ResultCardProps {
  record: QueryRecord;
  onBack: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ record, onBack }) => {
  const { 
    brand, model, confidence_score, risk_level, reasoning, recommended_action, resale_value, currency_code, recommended_repair_hubs, sources,
    diy_guides, required_tools, purchase_options, parts_retailers, category_mismatch, identified_category
  } = record.ai_response;

  const [diyState, setDiyState] = React.useState<'locked' | 'confirm' | 'unlocked'>('locked');
  const repairHubsRef = React.useRef<HTMLDivElement>(null);

  const scrollToSpecialists = () => {
    setDiyState('locked');
    repairHubsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen text-black dark:text-white pb-40 transition-colors duration-500">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark transition-colors">
        <button onClick={onBack} className="w-10 h-10 border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40">Diagnosis Report</h2>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-10">
        {/* Category Mismatch Warning */}
        {category_mismatch && (
          <div className="p-5 bg-primary/5 border border-primary/20 flex gap-4 items-center animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Quick Tip</p>
              <p className="text-[9px] font-bold uppercase opacity-60 leading-relaxed">
                You selected: <span className="text-primary">{record.category}</span> but we detected: <span className="text-primary">{identified_category}</span>. 
                Next time, try selecting the correct category for better results.
              </p>
            </div>
          </div>
        )}

        {/* Device Profile */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] border ${risk_level === 'High' || risk_level === 'Extreme' ? 'bg-hazard/10 text-hazard border-hazard/20' : 'bg-terminal-green/10 text-terminal-green border-terminal-green/20'}`}>
               {risk_level} Risk Level
            </span>
            <span className="text-[9px] font-mono opacity-30 uppercase">Match {Math.round(confidence_score)}%</span>
          </div>
          <h1 className="text-5xl font-black leading-[0.85] tracking-tighter uppercase italic mb-4">
            {brand}<br/><span className="text-primary">{model}</span>
          </h1>
        </section>

        {/* Financial Audit */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
             <Icons.Circuit className="text-primary text-sm" />
             <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Value Breakdown</h3>
          </div>
          <div className="grid grid-cols-3 bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark divide-x divide-border-light dark:divide-white/10">
             <div className="p-4 text-center">
                <p className="text-[8px] font-black uppercase opacity-40 mb-2 italic">Broken</p>
                <p className="text-sm font-black font-mono">{formatCurrency(resale_value.unit_value_broken, currency_code)}</p>
             </div>
             <div className="p-4 text-center">
                <p className="text-[8px] font-black uppercase opacity-40 mb-2 italic">Fixed</p>
                <p className="text-sm font-black font-mono">{formatCurrency(resale_value.unit_value_fixed, currency_code)}</p>
             </div>
             <div className="p-4 text-center bg-primary/5 dark:bg-primary/10">
                <p className="text-[8px] font-black uppercase text-primary mb-2 italic">Profit</p>
                <p className="text-sm font-black font-mono text-primary">{formatCurrency(resale_value.profit_potential, currency_code)}</p>
             </div>
          </div>
        </section>

        {/* Market Analysis */}
        {(purchase_options?.length > 0 || parts_retailers?.length > 0) && (
          <section className="space-y-6">
             <div className="flex items-center gap-2 px-2">
                <span className="material-symbols-outlined text-primary text-sm">shopping_cart</span>
                <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Where to Buy</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Purchase Options */}
                {purchase_options?.length > 0 && (
                   <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1 italic">Buy New Device</h4>
                      <div className="space-y-2">
                         {purchase_options.map((opt, i) => (
                            <a key={i} href={opt.uri} target="_blank" rel="noopener noreferrer" className="block p-4 bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark hover:border-primary transition-all">
                               <div className="flex justify-between items-center">
                                  <div>
                                     <p className="text-[10px] font-black uppercase">{opt.name}</p>
                                     <span className="text-[8px] font-bold opacity-30 uppercase">{opt.is_new ? 'Brand New' : 'Used/Refurb'}</span>
                                  </div>
                                  <p className="text-xs font-black text-primary font-mono">{opt.price}</p>
                               </div>
                            </a>
                         ))}
                      </div>
                   </div>
                )}

                {/* Parts Retailers */}
                {parts_retailers?.length > 0 && (
                   <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1 italic">Replacement Parts</h4>
                      <div className="space-y-2">
                         {parts_retailers.map((part, i) => (
                            <a key={i} href={part.uri} target="_blank" rel="noopener noreferrer" className="block p-4 bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark hover:border-terminal-green transition-all">
                               <p className="text-[10px] font-black uppercase">{part.part_name}</p>
                               <p className="text-[8px] font-bold opacity-30 uppercase">via {part.name}</p>
                            </a>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          </section>
        )}

        {/* Recommended Action */}
        <section className="bg-primary dark:bg-white text-white dark:text-black p-8 relative overflow-hidden transition-colors duration-500 shadow-xl">
           <div className="absolute top-0 left-0 w-2 h-full bg-white dark:bg-primary opacity-20 dark:opacity-100"></div>
           <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 italic opacity-70">Our Recommendation</h4>
           <p className="text-4xl font-black italic uppercase leading-none mb-6 tracking-tighter">{recommended_action}</p>
           <p className="text-xs font-bold leading-relaxed uppercase opacity-80">{reasoning}</p>
        </section>

        {/* Grounding Sources */}
        {sources && sources.length > 0 && (
          <section className="space-y-4">
             <div className="flex items-center gap-2 px-2">
                <Icons.Grounded className="text-primary text-sm" />
                <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Sources</h3>
             </div>
             <div className="flex flex-wrap gap-2">
                {sources.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark rounded text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                     {new URL(url).hostname.replace('www.', '')}
                  </a>
                ))}
             </div>
          </section>
        )}

        {/* Repair Hubs */}
        <section className="space-y-4" ref={repairHubsRef}>
          <div className="flex items-center gap-2 px-2">
             <Icons.Radar className="text-primary text-sm" />
             <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Repair Shops Near You</h3>
          </div>
          <div className="space-y-2">
             {recommended_repair_hubs.map((hub, i) => (
               <a key={i} href={hub.uri} target="_blank" rel="noopener noreferrer" className="block p-5 bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark hover:border-primary transition-all group">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-sm font-black uppercase italic group-hover:text-primary">{hub.name}</p>
                     <span className="text-[10px] font-black text-terminal-green uppercase">{hub.rating} ★</span>
                  </div>
                  <p className="text-[9px] font-bold opacity-40 uppercase truncate">{hub.address}</p>
               </a>
             ))}
          </div>
        </section>

        {/* DIY Section */}
        <section className="pt-10 border-t border-border-light dark:border-white/10 space-y-6">
           <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-primary text-sm">build</span>
              <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Fix It Yourself</h3>
           </div>

           {diyState === 'locked' && (
              <div className="p-8 bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark space-y-6">
                 <div className="space-y-2">
                    <p className="text-xs font-black uppercase italic text-hazard">Warning</p>
                    <p className="text-[10px] font-bold uppercase opacity-60 leading-relaxed">
                       DIY repairs may void warranties, cause permanent data loss, or lead to physical injury (especially involving batteries/voltage).
                    </p>
                 </div>
                 <button 
                  onClick={() => setDiyState('confirm')}
                  className="w-full bg-white dark:bg-white/10 border border-black dark:border-white/20 text-black dark:text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                 >
                    Show Me How
                 </button>
              </div>
           )}

           {diyState === 'confirm' && (
              <div className="p-8 bg-hazard/5 border border-hazard/30 space-y-6 animate-pulse">
                 <p className="text-center text-sm font-black uppercase italic">Are you absolutely sure?</p>
                 <p className="text-center text-[9px] font-bold uppercase opacity-60">
                    By proceeding, you accept the risks involved.
                 </p>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => setDiyState('unlocked')}
                      className="flex-1 bg-hazard text-white py-4 font-black uppercase tracking-widest text-[10px]"
                    >
                      Yes, Proceed
                    </button>
                    <button 
                      onClick={scrollToSpecialists}
                      className="flex-1 bg-panel-light dark:bg-white/10 py-4 font-black uppercase tracking-widest text-[10px]"
                    >
                      No, Go Back
                    </button>
                 </div>
              </div>
           )}

           {diyState === 'unlocked' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                 {/* Tools */}
                 <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2 italic">Tools You'll Need</h4>
                    <div className="grid grid-cols-1 gap-2">
                       {required_tools && required_tools.length > 0 ? (
                         required_tools.map((tool, i) => (
                           <div key={i} className="p-4 bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark flex justify-between items-center group">
                              <div>
                                 <p className="text-xs font-black uppercase">{tool.name}</p>
                                 <p className="text-[9px] font-medium opacity-40 uppercase mt-0.5">{tool.reason}</p>
                              </div>
                              {tool.link && (
                                <a href={tool.link} target="_blank" rel="noopener noreferrer" className="material-symbols-outlined text-primary text-xl opacity-0 group-hover:opacity-100 transition-opacity">shopping_cart</a>
                              )}
                           </div>
                         ))
                       ) : (
                         <div className="p-4 border border-dashed border-border-light dark:border-border-dark opacity-30 text-center">
                           <p className="text-[10px] italic uppercase">No specific tools needed for this repair.</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Guides */}
                 <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2 italic">Repair Guides</h4>
                    <div className="space-y-2">
                       {diy_guides && diy_guides.length > 0 ? (
                         diy_guides.map((guide, i) => (
                           <a key={i} href={guide.uri} target="_blank" rel="noopener noreferrer" className="block p-5 bg-panel-light dark:bg-white/5 border border-border-light dark:border-border-dark hover:border-primary transition-all group">
                               <div className="flex justify-between items-start mb-2">
                                 <p className="text-sm font-black uppercase italic group-hover:text-primary leading-tight pr-4">{guide.title}</p>
                                 <div className="text-right">
                                    <span className="text-[9px] font-black text-primary uppercase whitespace-nowrap block">{guide.platform}</span>
                                    {guide.author && <span className="text-[8px] font-bold opacity-40 uppercase whitespace-nowrap">by {guide.author}</span>}
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <span className="text-[8px] font-black opacity-40 uppercase tracking-widest italic">{guide.difficulty} Difficulty</span>
                                 {guide.duration && <span className="text-[8px] font-black opacity-40 uppercase tracking-widest italic">{guide.duration}</span>}
                              </div>
                           </a>
                         ))
                       ) : (
                         <div className="p-8 border border-dashed border-border-light dark:border-border-dark opacity-40 text-center space-y-2">
                            <p className="text-[10px] font-black uppercase">No guides found</p>
                            <p className="text-[8px] leading-relaxed uppercase">We couldn't find specific repair guides. Try searching online or contact a professional.</p>
                         </div>
                       )}
                    </div>
                 </div>

                 <button 
                   onClick={scrollToSpecialists}
                   className="w-full py-4 border border-primary text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all italic mt-4"
                 >
                   Find a Repair Shop
                 </button>
              </div>
           )}
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark flex gap-4 max-w-md mx-auto w-full z-50 transition-colors">
         <button className="flex-1 bg-black dark:bg-white text-white dark:text-black py-5 font-black uppercase tracking-[0.3em] italic shadow-lg active:scale-95 transition-all">
            Export JSON
         </button>
      </footer>
    </div>
  );
};

export default ResultCard;
