type LotTubeProps = {
  shaking?: boolean;
  raised?: boolean;
};

export function LotTube({ shaking = false, raised = false }: LotTubeProps) {
  return (
    <div className={shaking ? "lot-tube shaking" : "lot-tube"} aria-hidden="true">
      <svg viewBox="0 0 220 280">
        <defs>
          <linearGradient id="tubeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a2e18" />
            <stop offset="15%" stopColor="#8c582c" />
            <stop offset="85%" stopColor="#6b4423" />
            <stop offset="100%" stopColor="#3d2311" />
          </linearGradient>
          <linearGradient id="stickGrad" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor="#f5e6ce" />
             <stop offset="100%" stopColor="#b59871" />
          </linearGradient>
          <linearGradient id="rimGrad" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor="#c4a57a" />
             <stop offset="50%" stopColor="#f0dbb6" />
             <stop offset="100%" stopColor="#a38255" />
          </linearGradient>
        </defs>
        <g stroke="url(#stickGrad)" strokeWidth="7" fill="none" strokeLinecap="round">
          <path d="M70 30 76 162" />
          <path d="M96 18 98 160" />
          <path d="M125 24 120 162" />
          <path d="M151 38 139 165" />
        </g>
        {raised ? <path stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" d="M110 -2 112 143" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6))" }} /> : null}
        <path fill="#1a0f0a" d="M48 108 Q108 84 170 108 L154 244 Q108 268 64 244Z" />
        <path fill="url(#tubeGrad)" stroke="#1a0f0a" strokeWidth="3" d="M56 102 Q110 126 164 102 L150 238 Q108 260 70 238Z" />
        <ellipse fill="url(#rimGrad)" stroke="#2a1b12" strokeWidth="2" cx="110" cy="103" rx="57" ry="20" />
        <path fill="rgba(139, 26, 26, 0.9)" d="M95 156 Q112 146 128 157 L124 191 Q110 201 98 190Z" />
      </svg>
    </div>
  );
}

export function FateStick() {
  return (
    <div className="fate-stick" aria-hidden="true">
      <svg viewBox="0 0 64 260">
        <defs>
          <linearGradient id="stickMain" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor="#e8d0a9" />
             <stop offset="50%" stopColor="#f5e6ce" />
             <stop offset="100%" stopColor="#b59871" />
          </linearGradient>
        </defs>
        <path fill="url(#stickMain)" stroke="#3a2818" strokeWidth="2" d="M28 8 Q35 4 39 10 L36 236 Q31 252 24 236Z" />
        <circle cx="32" cy="26" r="6" fill="#8b1a1a" />
        <path d="M23 72 Q32 78 41 72" fill="none" stroke="rgba(58, 40, 24, 0.6)" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 116 Q32 122 40 116" fill="none" stroke="rgba(58, 40, 24, 0.6)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
