import React, { useState, useRef } from 'react';
import { DeviceCategory } from '../types';
import { runForensicAudit } from '../src/services/geminiService';
import { supabaseService } from '../src/services/supabaseService';
import { cacheService } from '../src/services/cacheService';
import { useApp } from '../providers/AppProvider';
import { TitanError, logError } from '../src/utils/errors';

const DiagnosticForm: React.FC<{ onSuccess: (log: any) => void, onCancel: () => void }> = ({ onSuccess, onCancel }) => {
  const { refreshState } = useApp();
  const [step, setStep] = useState<'intake' | 'camera' | 'synthesis'>('intake');
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState<DeviceCategory>(DeviceCategory.PHONE);
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      alert("Camera not available");
      setStep('intake');
    }
  };

  const capture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.8)]);
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setStep('intake');
    }
  };

  const cancelCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach(t => t.stop());
    }
    setStep('intake');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = '';
  };

  const handleAudit = async () => {
    if (images.length === 0) return;
    setStep('synthesis');
    setStatus("Getting your location...");
    
    let location = undefined;
    try {
      // OPTIONAL LOCATION: We ask, but don't insist. 
      // Short timeout (3s) so users aren't waiting if they ignore the prompt.
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          timeout: 3000, 
          enableHighAccuracy: false
        });
      });
      location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {
      console.warn("LOCATION_SKIPPED: User denied or timed out. Proceeding with global defaults.");
    }

    // AI HANDSHAKE: Check cache first to avoid redundant AI usage
    // We pass 'images' so the cache key includes the image hash (preventing stale results on new photos)
    const cachedResult = cacheService.get(category, desc, images, location?.latitude, location?.longitude);
    
    try {
      let result;
      if (cachedResult) {
        setStatus("Loading saved results...");
        result = cachedResult;
      } else {
        setStatus("Analyzing your device...");
        result = await runForensicAudit(category, desc, images, location);
        // Store in cache for future users
        cacheService.set(category, desc, images, result, location?.latitude, location?.longitude);
      }
      
      setStatus("Saving results...");
      const log = await supabaseService.saveLog(category, desc, images, result);
      await refreshState();
      onSuccess(log);
    } catch (e) {
      logError(e, 'DiagnosticForm.handleAudit');
      
      let msg = "Analysis failed. Please try again.";
      if (e instanceof TitanError) {
        msg = e.userMessage;
      } else if (e instanceof Error && e.message.includes('429')) {
         msg = "System Overload. TITAN is at capacity. Please try again in 1 minute.";
      } else if (e instanceof Error) {
        console.error("[DIAGNOSIS_ERROR]", e.message);
        console.error("[DIAGNOSIS_STACK]", e.stack);
      } else {
        console.error("[DIAGNOSIS_UNKNOWN_ERROR]", e);
      }
      
      alert(msg);
      setStep('intake');
    }
  };

  if (step === 'synthesis') return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-10 text-center animate-pulse">
      <div className="w-16 h-16 border-2 border-primary border-t-transparent animate-spin mb-8"></div>
      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white transition-colors">Analyzing</h2>
      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.5em] mt-2">{status}</p>
    </div>
  );

  if (step === 'camera') return (
    <div className="fixed inset-0 bg-black z-[300] flex flex-col">
       <div className="relative flex-1 bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale" />
          <div className="camera-crosshair-h"></div>
          <div className="camera-crosshair-v"></div>
       </div>
       <div className="h-48 bg-black border-t border-white/10 flex flex-col items-center justify-center gap-4 px-6">
          <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-primary p-1 active:scale-95 transition-all shadow-lg shadow-primary/50">
             <div className="w-full h-full bg-primary rounded-full"></div>
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Tap to Capture</p>
          <button onClick={cancelCamera} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mt-2">
            Cancel
          </button>
       </div>
    </div>
  );

  return (
    <div className="p-6 pb-40 space-y-10 animate-in slide-in-from-bottom-8">
      <header className="flex justify-between items-end">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black dark:text-white transition-colors">Intake<br/><span className="text-primary">Source</span></h2>
        <button onClick={onCancel} className="text-[10px] font-black opacity-30 uppercase italic tracking-widest mb-2">Abort</button>
      </header>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 px-1">Visual Telemetry</p>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
           {images.map((img, i) => (
             <div key={i} className="relative w-32 h-44 shrink-0 border border-border-light dark:border-white/10 bg-panel-light dark:bg-white/5 overflow-hidden group">
                <img src={img} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" alt="Asset" />
                <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-black/80 p-1 text-[10px] uppercase font-black text-white">DEL</button>
             </div>
           ))}
           
           <div className="flex gap-3">
             <button onClick={startCamera} className="w-32 h-44 shrink-0 border border-dashed border-border-light dark:border-white/20 flex flex-col items-center justify-center gap-2 hover:border-primary group transition-all">
                <span className="material-symbols-outlined text-3xl opacity-30 group-hover:opacity-100 group-hover:scale-110">photo_camera</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-center px-2">Open Lens</span>
             </button>

             <button onClick={() => fileInputRef.current?.click()} className="w-32 h-44 shrink-0 border border-dashed border-border-light dark:border-white/20 flex flex-col items-center justify-center gap-2 hover:border-terminal-green group transition-all">
                <span className="material-symbols-outlined text-3xl opacity-30 group-hover:opacity-100 group-hover:scale-110">upload_file</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-center px-2">Import Asset</span>
             </button>
           </div>
           
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
           />
        </div>
      </section>

      <section className="space-y-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 px-1 mb-4">Device Architecture</p>
           <div className="grid grid-cols-2 gap-2">
              {Object.values(DeviceCategory).map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategory(cat)}
                  className={`p-4 text-[10px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(19,127,236,0.3)]' : 'bg-panel-light dark:bg-white/5 text-black dark:text-white/40 border-border-light dark:border-white/10'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 px-1 mb-4">Symptom Log</p>
           <textarea 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Document logic failure, liquid intrusion, or physical trauma..."
            className="w-full h-40 bg-panel-light dark:bg-black border border-border-light dark:border-white/10 p-4 font-mono text-xs outline-none focus:border-primary text-black dark:text-white placeholder:opacity-40"
           />
        </div>
      </section>

      <button 
        disabled={images.length === 0}
        onClick={handleAudit}
        className="w-full bg-black dark:bg-white text-white dark:text-black py-6 font-black uppercase tracking-[0.4em] italic shadow-glow disabled:opacity-10 transition-colors"
      >
        Execute Audit
      </button>
    </div>
  );
};

export default DiagnosticForm;
