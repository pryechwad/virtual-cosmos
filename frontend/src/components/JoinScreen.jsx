import { useState, useEffect, useRef } from 'react';

const AVATAR_STYLES = [
  { id: 'adventurer', label: '🧑 Adventurer' },
  { id: 'avataaars', label: '👤 Avataaars' },
  { id: 'bottts', label: '🤖 Bottts' },
  { id: 'micah', label: '🎨 Micah' },
  { id: 'miniavs', label: '🪄 Mini' },
  { id: 'personas', label: '🧬 Personas' },
];

function getAvatarPreview(style, seedStr) {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seedStr)}&radius=12`;
}

export default function JoinScreen({ onJoin }) {
  const [username, setUsername] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('adventurer');
  const [selectedVariant, setSelectedVariant] = useState(1);
  const [isJoining, setIsJoining] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const micStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const currentSeed = username.trim() ? `${username.trim()}-V${selectedVariant}` : `preview-V${selectedVariant}`;

  useEffect(() => {
    if (cameraOn) {
      setCameraError(false);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => {
          setCameraError(true);
          setCameraOn(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [cameraOn]);

  useEffect(() => {
    if (micOn) {
      setMicError(false);
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          micStreamRef.current = stream;
          const ctx = new AudioContext();
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;

          const data = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteFrequencyData(data);
            const avg = data.reduce((a, b) => a + b, 0) / data.length;
            setAudioLevel(Math.min(100, avg * 2));
            animFrameRef.current = requestAnimationFrame(tick);
          };
          tick();
        })
        .catch(() => {
          setMicError(true);
          setMicOn(false);
        });
    } else {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      cancelAnimationFrame(animFrameRef.current);
      setAudioLevel(0);
    }
    return () => {
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [micOn]);

  const handleJoin = () => {
    if (!username.trim()) return;
    setIsJoining(true);
    onJoin({ 
      username: username.trim(), 
      avatarStyle: selectedStyle,
      avatarSeed: currentSeed
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col font-sans overflow-y-auto text-slate-900">
      
      {/* Navbar - Simplified */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-8 py-5 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          {/* Logo/Branding removed as per request */}
        </div>
        <div>
          {/* Sign In button removed as per request */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 px-10 py-16 max-w-7xl mx-auto w-full">
        
        {/* Left Section: Join Form */}
        <div className="w-full max-w-sm flex flex-col space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-black">
              Joining lobby
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              To join the conversation, please enter your name and pick an avatar.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Your name
              </label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex. Prathmesh"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 text-base font-semibold focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Avatar style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${selectedStyle === style.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="join-button"
              onClick={handleJoin}
              disabled={!username.trim() || isJoining}
              className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-sm uppercase tracking-widest
                         hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-30 p-2"
            >
              {isJoining ? 'Joining...' : 'Enter lobby'}
            </button>
          </div>
        </div>

        {/* Right Section: Large Preview */}
        <div className="w-full flex-1 max-w-xl">
          <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden p-4 shadow-sm">
            <div className="bg-slate-50 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden border border-slate-100">
                {/* Camera video feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraOn ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Avatar preview (shown when camera is off) */}
                <img
                  src={getAvatarPreview(selectedStyle, currentSeed)}
                  alt="Avatar preview"
                  className={`w-64 h-64 object-contain transition-opacity duration-300 ${cameraOn ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Camera error */}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Camera access denied</span>
                  </div>
                )}

                {/* Camera toggle button */}
                <button
                  onClick={() => setCameraOn((v) => !v)}
                  className="absolute bottom-5 left-5 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 rounded-full text-white text-[10px] font-bold transition-all"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${cameraOn ? 'bg-green-400' : 'bg-red-500'}`} />
                  {cameraOn ? 'CAMERA ON' : 'CAMERA OFF'}
                </button>
              </div>

              {/* Avatar Variants (4 options) */}
              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Select a variation
                </p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4].map((variant) => {
                    const variantSeed = username.trim() ? `${username.trim()}-V${variant}` : `preview-V${variant}`;
                    return (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`w-16 h-16 rounded-xl border-2 transition-all overflow-hidden bg-slate-50
                          ${selectedVariant === variant ? 'border-indigo-600 shadow-md transform scale-105' : 'border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100'}`}
                      >
                        <img 
                          src={getAvatarPreview(selectedStyle, variantSeed)} 
                          alt={`Variant ${variant}`} 
                          className="w-full h-full object-contain" 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6 px-2 flex items-center justify-between">
                <div className="flex gap-4">
                  {/* Mic toggle */}
                  <button
                    onClick={() => setMicOn((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all
                      ${micOn ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${micOn ? 'bg-green-500' : 'bg-red-400'}`} />
                    {micOn ? 'MIC ON' : 'MIC OFF'}
                  </button>

                  {/* Audio level bar (visible when mic is on) */}
                  {micOn && (
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full transition-all duration-75"
                          style={{
                            height: `${8 + i * 3}px`,
                            backgroundColor: audioLevel > (i + 1) * 12 ? '#6366f1' : '#e2e8f0',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {micError && (
                    <span className="text-[10px] text-red-500 font-medium">Mic denied</span>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Video</span>
                  <span className="text-[11px] text-slate-900 font-bold">{cameraOn ? 'Camera On' : 'Camera Off'}</span>
                </div>
              </div>
          </div>
        </div>
      </main>

      {/* Footer - Credits removed */}
      <footer className="mt-auto px-10 py-12 flex items-center justify-between max-w-7xl mx-auto w-full border-t border-slate-200">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          &copy; 2026 Virtual Ecosystem
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Privacy</a>
          <a href="#" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Terms</a>
        </div>
      </footer>

    </div>
  );
}
