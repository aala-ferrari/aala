import { Calendar, User, Bell, Search, Plus, Heart } from 'lucide-react';
import { BrowserFrame } from './BrowserFrame';

const HOURS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
const APPOINTMENTS = [
  { h: '09:00', name: 'Marco Rossi', type: 'Visita controllo', color: '#0e7c8a', span: 1 },
  { h: '10:00', name: 'Anna Bianchi', type: 'Prima visita', color: '#a85a1a', span: 2 },
  { h: '11:30', name: 'Luca Verdi', type: 'Esame ECG', color: '#2a7a5c', span: 1 },
];

export function MedicalMockup() {
  return (
    <BrowserFrame url="medical.aala.io/agenda">
      <div className="flex h-[560px]">
        {/* sidebar */}
        <aside className="w-56 shrink-0 border-r border-ink-line/60 bg-canvas-warm/40 p-4">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0e7c8a] text-white">
              <Heart className="h-4 w-4" />
            </div>
            <span className="font-display text-sm text-ink">Medical</span>
          </div>
          {[
            { icon: Calendar, label: 'Agenda', active: true },
            { icon: User, label: 'Pazienti' },
            { icon: Heart, label: 'Cartelle' },
            { icon: Bell, label: 'Promemoria' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                  item.active ? 'bg-[#0e7c8a]/10 text-[#0e7c8a]' : 'text-ink-soft'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            );
          })}

          <div className="mt-8 rounded-xl border border-ink-line/60 bg-white p-3">
            <p className="text-[10px] uppercase tracking-widest text-ink-mute">Oggi</p>
            <p className="mt-1 font-display text-2xl text-ink">12</p>
            <p className="text-[10px] text-ink-soft">visite in agenda</p>
          </div>
        </aside>

        {/* main */}
        <div className="flex-1">
          {/* topbar */}
          <div className="flex items-center justify-between border-b border-ink-line/60 px-6 py-3">
            <div className="flex items-center gap-2 text-xs text-ink-soft">
              <Search className="h-3.5 w-3.5" />
              <span>Cerca paziente, visita, prescrizione...</span>
            </div>
            <button className="flex items-center gap-1 rounded-full bg-[#0e7c8a] px-3 py-1.5 text-[10px] font-medium text-white">
              <Plus className="h-3 w-3" /> Nuova visita
            </button>
          </div>

          {/* agenda */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">Martedì, 14 Maggio</h3>
              <div className="flex gap-1">
                <button className="rounded-md border border-ink-line/60 px-2 py-1 text-[10px] text-ink-soft">Giorno</button>
                <button className="rounded-md bg-ink/90 px-2 py-1 text-[10px] text-white">Settimana</button>
                <button className="rounded-md border border-ink-line/60 px-2 py-1 text-[10px] text-ink-soft">Mese</button>
              </div>
            </div>

            <div className="grid grid-cols-[60px_1fr] gap-2">
              {HOURS.map((h) => {
                const appt = APPOINTMENTS.find((a) => a.h === h);
                return (
                  <div key={h} className="contents">
                    <div className="py-3 text-right text-[10px] text-ink-mute">{h}</div>
                    <div className="min-h-[40px] border-t border-ink-line/40">
                      {appt && (
                        <div
                          className="mt-1 rounded-lg border-l-2 px-3 py-2"
                          style={{ borderColor: appt.color, background: `${appt.color}0d` }}
                        >
                          <p className="text-xs font-medium text-ink">{appt.name}</p>
                          <p className="text-[10px] text-ink-soft">{appt.type}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
