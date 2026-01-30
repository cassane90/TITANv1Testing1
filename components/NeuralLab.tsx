
import React, { useState, useRef } from 'react';
import { generateReferenceImage, editDeviceImage } from '../src/services/geminiService';

const NeuralLab: React.FC = () => {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const execute = async () => {
    if (!prompt) return;
    setIsProcessing(true);
    try {
      let res;
      if (mode === 'generate') {
        res = await generateReferenceImage(prompt);
      } else if (image) {
        res = await editDeviceImage(image, prompt);
      }
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[82vh] w-full flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Viewport Area */}
      <main className="relative flex-1 overflow-hidden rounded-t-[3rem] bg-black">
        {result || image ? (
          <div className="absolute inset-0">
            <div 
                className="h-full w-full bg-cover bg-center flex flex-col justify-end" 
                style={{ backgroundImage: `linear-gradient(0deg, rgba(16, 22, 34, 0.9) 0%, rgba(16, 22, 34, 0) 40%), url("${result || image}")` }}
            >
                {/* AI Overlays Simulation */}
                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                
                {result && (
                    <>
                        <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full amber-glow animate-breathing flex items-center justify-center">
                            <div className="bg-amber-500/20 p-2 rounded text-[8px] font-black text-amber-500 border border-amber-500/50 uppercase tracking-widest italic">
                                Fault Detected
                            </div>
                        </div>
                        <div className="absolute bottom-1/3 right-1/4">
                            <div className="glass-pill p-3 rounded-xl border-l-4 border-primary">
                                <p className="text-[9px] text-primary font-black uppercase tracking-widest">Logic Node</p>
                                <p className="text-[10px] text-white font-mono">U7000: 0.2V Critical</p>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex flex-col p-8 gap-1 relative z-10">
                    <p className="text-white tracking-tight text-3xl font-black font-brand italic uppercase">Imaging Viewport</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Neural Triage Active</p>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted opacity-40 gap-4">
              <span className="material-symbols-outlined text-6xl">videocam_off</span>
              <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Telemetry Ingest</p>
          </div>
        )}

        {/* Floating Side HUD */}
        <div className="absolute top-6 right-6 z-40 w-44 flex flex-col gap-4">
            <div className="glass-pill p-4 rounded-2xl shadow-xl">
                <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1.5 opacity-60">Confidence</p>
                <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-white font-brand">98.4%</span>
                </div>
                <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '98%' }}></div>
                </div>
            </div>
        </div>
      </main>

      {/* Control Panel */}
      <section className="bg-surface dark:bg-surface-dark p-6 pt-4 border-t border-gray-200 dark:border-border-dark z-50">
        <h4 className="text-text-muted text-[9px] font-black leading-normal tracking-[0.3em] py-3 text-center uppercase opacity-60 italic">Diagnostic Control</h4>
        
        <div className="flex gap-3 mb-5">
          <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4 border border-gray-200 dark:border-border-dark bg-surface-highlight/50">
            <p className="text-text-muted text-[9px] font-black uppercase tracking-widest opacity-60">Faults</p>
            <p className="text-text text-xl font-black font-brand uppercase">3 Points</p>
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4 border border-gray-200 dark:border-border-dark bg-surface-highlight/50">
            <p className="text-text-muted text-[9px] font-black uppercase tracking-widest opacity-60">Status</p>
            <p className="text-red-500 text-xl font-black font-brand uppercase italic">Critical</p>
          </div>
        </div>

        <div className="space-y-4">
            <div className="flex p-1 bg-surface-highlight rounded-2xl border border-gray-200 dark:border-border-dark">
                <button 
                    onClick={() => setMode('generate')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'generate' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
                >
                    Synthesize
                </button>
                <button 
                    onClick={() => setMode('edit')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'edit' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
                >
                    Modify
                </button>
            </div>

            <div className="flex gap-3">
                <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'generate' ? "Synthesize schematic for..." : "Overlay liquid damage points..."}
                    className="flex-1 bg-surface-highlight border-none rounded-xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary"
                />
                {mode === 'edit' && (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 bg-surface-highlight text-text-muted rounded-xl border border-gray-200 dark:border-border-dark hover:text-primary transition-all"
                    >
                        <span className="material-symbols-outlined">add_a_photo</span>
                    </button>
                )}
                <button 
                    onClick={execute}
                    disabled={isProcessing}
                    className="p-4 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined">{isProcessing ? 'sync' : 'bolt'}</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
        </div>
      </section>
    </div>
  );
};

export default NeuralLab;
