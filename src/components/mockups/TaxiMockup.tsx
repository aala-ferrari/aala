import { Smartphone, MapPin, Star, Wallet, Navigation, User } from 'lucide-react';
import { BrowserFrame } from './BrowserFrame';

const DRIVERS = [
  { name: 'Driver #18 · BMW Serie 2', status: 'In corsa', rating: 4.9, color: '#0e7c8a' },
  { name: 'Driver #07 · Mercedes', status: 'Disponibile', rating: 4.8, color: '#2a7a5c' },
  { name: 'Driver #23 · Tesla Model 3', status: 'Pausa', rating: 5.0, color: '#a85a1a' },
];

const RIDES = [
  { from: 'Aeroporto', to: 'Centro', driver: 'Marco P.', price: '€18.50', time: '4 min' },
  { from: 'Stazione Centrale', to: 'Hotel Belvedere', driver: 'Lara D.', price: '€11.20', time: '7 min' },
  { from: 'Via Roma 14', to: 'Quartiere Fiera', driver: 'Andi K.', price: '€9.80', time: '12 min' },
];

export function TaxiMockup() {
  return (
    <BrowserFrame url="taxi.aala.io/dispatch">
      <div className="grid h-[560px] grid-cols-[55%_45%]">
        {/* left: live map + KPI */}
        <div className="border-r border-ink-line/60 p-5">
          {/* KPI strip */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {[
              { label: 'Corse oggi', value: '247', icon: Navigation },
              { label: 'Driver attivi', value: '38', icon: User },
              { label: 'Incasso giornaliero', value: '€3.2k', icon: Wallet },
              { label: 'Rating medio', value: '4.87', icon: Star },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-lg border border-ink-line/60 bg-white p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-widest text-ink-mute">
                      {s.label}
                    </p>
                    <Icon className="h-3 w-3 text-[#f5b800]" />
                  </div>
                  <p className="mt-1.5 font-display text-xl text-ink">{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* live map */}
          <div
            className="relative h-[420px] overflow-hidden rounded-xl border border-ink-line/60"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 35% 40%, rgba(245,184,0,0.20), transparent 60%), linear-gradient(180deg, #fdf4d6 0%, #f3e3a8 100%)',
            }}
          >
            {/* fake streets */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 420" preserveAspectRatio="none">
              <path d="M 0 200 Q 200 80, 400 240" stroke="rgba(15,25,42,0.12)" strokeWidth="3" fill="none" />
              <path d="M 60 0 Q 230 200, 110 420" stroke="rgba(15,25,42,0.10)" strokeWidth="2" fill="none" />
              <path d="M 0 100 L 400 130" stroke="rgba(15,25,42,0.08)" strokeWidth="2" fill="none" />
              <path d="M 220 0 L 280 420" stroke="rgba(15,25,42,0.08)" strokeWidth="2" fill="none" />
              <path d="M 0 320 L 400 360" stroke="rgba(15,25,42,0.06)" strokeWidth="1.5" fill="none" />
            </svg>

            {/* driver pins (taxi rooftop light style) */}
            {[
              { x: 22, y: 30, color: '#0e7c8a', label: '18' },
              { x: 55, y: 50, color: '#0e7c8a', label: '14' },
              { x: 70, y: 22, color: '#2a7a5c', label: '07' },
              { x: 35, y: 65, color: '#a85a1a', label: '23' },
              { x: 80, y: 70, color: '#0e7c8a', label: '32' },
              { x: 18, y: 55, color: '#2a7a5c', label: '11' },
              { x: 48, y: 80, color: '#0e7c8a', label: '29' },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white shadow-md"
                  style={{ background: p.color }}
                >
                  {p.label}
                </div>
                {/* glow */}
                <div
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${p.color}66, transparent 70%)`,
                    transform: 'scale(2.5)',
                  }}
                />
              </div>
            ))}

            {/* pickup destination */}
            <div className="absolute left-[44%] top-[44%]">
              <div className="flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f5b800] text-white shadow-lg ring-4 ring-[#f5b800]/30">
                <MapPin className="h-4 w-4" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 rounded-lg border border-ink-line/40 bg-white/90 px-3 py-2 backdrop-blur">
              <p className="text-[10px] uppercase tracking-widest text-ink-mute">Tirana — centro</p>
              <p className="text-xs font-medium text-ink">7 driver in zona</p>
            </div>
          </div>
        </div>

        {/* right: live rides + drivers */}
        <div className="p-5">
          {/* live rides */}
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base text-ink">Corse in tempo reale</h3>
              <span className="rounded-full bg-[#f5b800]/12 px-2 py-0.5 text-[10px] font-medium text-[#f5b800]">
                3 live
              </span>
            </div>
            <div className="space-y-2">
              {RIDES.map((r, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-ink-line/50 bg-white p-2.5"
                >
                  <div className="flex items-start justify-between text-xs">
                    <div>
                      <p className="font-medium text-ink">{r.from} → {r.to}</p>
                      <p className="mt-0.5 text-[10px] text-ink-soft">{r.driver}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm text-[#2a7a5c]">{r.price}</p>
                      <p className="text-[10px] text-ink-mute">ETA {r.time}</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-canvas-warm/60">
                    <div className="h-full rounded-full bg-[#f5b800]" style={{ width: `${30 + i * 25}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* drivers status */}
          <div>
            <h3 className="mb-3 font-display text-base text-ink">Driver online</h3>
            <div className="space-y-2">
              {DRIVERS.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-ink-line/50 bg-white p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas-warm/60">
                      <User className="h-3 w-3 text-ink-soft" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{d.name}</p>
                      <p className="flex items-center gap-1 text-[10px] text-ink-soft">
                        <Star className="h-2.5 w-2.5 fill-current text-[#c9a849]" />
                        {d.rating}
                      </p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                    style={{ background: `${d.color}1a`, color: d.color }}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
