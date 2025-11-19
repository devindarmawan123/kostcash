const AboutKost = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl py-8 px-12 mt-10 mx-[12px] text-white">
          <div className="flex items-center gap-4 mb-3">
            {/* Logo */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50"></div>
                <svg width="48" height="48" viewBox="0 0 48 48" className="relative">
                  {/* Coin */}
                  <circle cx="24" cy="24" r="20" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
                  <circle cx="24" cy="24" r="16" fill="#FDE68A" opacity="0.7"/>
                  {/* Dollar sign */}
                  <text x="24" y="32" fontSize="24" fontWeight="bold" fill="#92400E" textAnchor="middle" fontFamily="Arial">$</text>
                  {/* Sparkles */}
                  <circle cx="10" cy="10" r="2" fill="#FFF" opacity="0.8"/>
                  <circle cx="38" cy="12" r="2" fill="#FFF" opacity="0.8"/>
                  <circle cx="40" cy="36" r="2" fill="#FFF" opacity="0.8"/>
                  <circle cx="8" cy="38" r="2" fill="#FFF" opacity="0.8"/>
                </svg>
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-1">
                Kost<span className="text-yellow-300">Cash</span>
              </h1>
              <p className="text-emerald-100 text-sm">Atur uang kost, hidup tenang!</p>
            </div>
          </div>
          <p className="text-emerald-50 opacity-90 text-sm max-w-2xl">
            Kelola keuangan kost kamu dengan smart, pantau pengeluaran, dan capai target saving! 💰✨
          </p>
        </div>
    )    
}

export default AboutKost