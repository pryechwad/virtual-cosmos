import { useState } from 'react';

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

  const currentSeed = username.trim() ? `${username.trim()}-V${selectedVariant}` : `preview-V${selectedVariant}`;

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
                <img
                  src={getAvatarPreview(selectedStyle, currentSeed)}
                  alt="Avatar preview"
                  className="w-64 h-64 object-contain"
                />

                {/* Overlay Label */}
                <div className="absolute bottom-5 left-5 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 rounded-full text-white text-[10px] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  CAMERA OFF
                </div>
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
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Mic</span>
                  <span className="text-[11px] text-slate-900 font-bold">Default Audio</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Video</span>
                  <span className="text-[11px] text-slate-900 font-bold">Integrated HD</span>
                </div>
              </div>
              <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
                Settings
              </button>
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
