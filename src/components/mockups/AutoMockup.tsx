import { Car, MapPin, Calendar, TrendingUp, Activity } from 'lucide-react';
import { BrowserFrame } from './BrowserFrame';

const FLEET = [
  { plate: 'AB123CD', model: 'BMW Serie 3', status: 'In viaggio', km: 42130, color: '#0e7c8a' },
  { plate: 'XY789ZW', model: 'Audi A4', status: 'Disponibile', km: 18500, color: '#2a7a5c' },
  { plate: 'CD456EF', model: 'Mercedes C-Class', status: 'Manutenzione', km: 89200, color: '#a85a1a' },
  { plate: 'GH012IJ', model: 'VW Passat', status: 'Disponibile', km: 23700, color: '#2a7a5c' },
];

export function AutoMockup() {
  return (
    <BrowserFrame url="auto.aala.io/fleet">
      <div className="grid h-[560px] grid-cols-[60%_40%]">
        {/* left: stats + map */}
        <div className="border-r border-ink-line/60 p-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Flotta', value: '64', icon: Car, color: '#a85a1a' },
              { label: 'In viaggio', value: '38', icon: Activity, color: '#0e7c8a' },
              { label: 'Booking oggi', value: '12', icon: Calendar, color: '#2a7a5c' },
              { label: 'Margine', value: '+18%', icon: TrendingUp, color: '#8a6717' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-ink-line/60 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-ink-mute">{s.label}</p>
                    <Icon className="h-3 w-3" style={{ color: s.color }} />
                  </div>
                  <p className="mt-2 font-display text-2xl text-ink">{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* map */}
          <div
            className="relative mt-5 h-[380px] overflow-hidden rounded-xl border border-ink-line/60"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(168,90,26,0.18), transparent 60%), linear-gradient(180deg, #f1ead7 0%, #e8dec0 100%)',
            }}
          >
            {/* fake roads */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 380" preserveAspectRatio="none">
              <path d="M 0 200 Q 150 100, 400 250" stroke="rgba(15,25,42,0.12)" strokeWidth="3" fill="none" />
              <path d="M 50 0 Q 200 200, 100 380" stroke="rgba(15,25,42,0.10)" strokeWidth="2" fill="none" />
              <path d="M 0 80 L 400 120" stroke="rgba(15,25,42,0.08)" strokeWidth="2" fill="none" />
              <path d="M 200 0 L 250 380" stroke="rgba(15,25,42,0.08)" strokeWidth="2" fill="none" />
            </svg>

            {/* car pins */}
            {[
              { x: 22, y: 35, color: '#0e7c8a' },
              { x: 55, y: 55, color: '#0e7c8a' },
              { x: 70, y: 25, color: '#2a7a5c' },
              { x: 35, y: 70, color: '#a85a1a' },
              { x: 80, y: 75, color: '#0e7c8a' },
              { x: 15, y: 60, color: '#2a7a5c' },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md"
                  style={{ background: p.color }}
                >
                  <Car className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}

            <div className="absolute bottom-3 left-3 rounded-lg border border-ink-line/40 bg-white/90 px-3 py-2 backdrop-blur">
              <p className="text-[10px] uppercase tracking-widest text-ink-mute">Centro Milano</p>
              <p className="text-xs font-medium text-ink">6 auto attive</p>
            </div>
          </div>
        </div>

        {/* right: fleet list */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg text-ink">Flotta</h3>
            <button className="rounded-full bg-[#a85a1a] px-3 py-1 text-[10px] font-medium text-white">
              + Aggiungi auto
            </button>
          </div>

          <div className="space-y-2">
            {FLEET.map((car) => (
              <div
                key={car.plate}
                className="flex items-center gap-3 rounded-xl border border-ink-line/50 bg-white p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-canvas-warm/60">
                  <Car className="h-4 w-4 text-ink-soft" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-ink">{car.plate}</p>
                  <p className="text-[10px] text-ink-soft">{car.model}</p>
                </div>
                <div className="text-right">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[9px]"
                    style={{ background: `${car.color}1a`, color: car.color }}
                  >
                    {car.status}
                  </span>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-ink-mute">
                    <MapPin className="h-2.5 w-2.5" />
                    {car.km.toLocaleString()} km
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
