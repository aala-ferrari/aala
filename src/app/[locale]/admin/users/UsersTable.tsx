'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Clock,
  Trash2,
  UserPlus,
  X,
  Check,
  Copy,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
}

export function UsersTable({
  users: initialUsers,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleRole(u: AdminUser) {
    if (u.id === currentUserId) return;
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    setBusyId(u.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${u.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Errore');
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, role: nextRole } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(u: AdminUser) {
    if (u.id === currentUserId) return;
    const ok = confirm(`Eliminare ${u.email}? L'operazione è irreversibile.`);
    if (!ok) return;
    setBusyId(u.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Errore');
      setUsers((prev) => prev.filter((p) => p.id !== u.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusyId(null);
    }
  }

  function addUserToList(u: AdminUser) {
    setUsers((prev) => [u, ...prev]);
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <UserPlus className="h-4 w-4" /> Crea utente
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="card-paper overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-ink-line/70 bg-canvas-warm/40">
            <tr className="text-left text-[10px] uppercase tracking-widest text-ink-mute">
              <th className="px-5 py-3">Utente</th>
              <th className="px-5 py-3">Ruolo</th>
              <th className="px-5 py-3">Stato</th>
              <th className="px-5 py-3">Ultimo accesso</th>
              <th className="px-5 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink-soft">
                  Nessun utente ancora.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-ink-line/40 last:border-0 hover:bg-canvas-warm/20"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas-warm text-ink-soft">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {u.full_name ?? '—'}
                          {u.id === currentUserId && (
                            <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-gold">
                              tu
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-ink-soft">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <RolePill role={u.role} />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs',
                        u.email_confirmed ? 'text-[#2a7a5c]' : 'text-[#a85a1a]'
                      )}
                    >
                      {u.email_confirmed ? (
                        <>
                          <Check className="h-3 w-3" /> Verificato
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3" /> In attesa
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-soft">
                    {u.last_sign_in_at ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(u.last_sign_in_at).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span className="text-ink-mute">mai</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={u.id === currentUserId || busyId === u.id}
                        title={
                          u.role === 'admin'
                            ? 'Rimuovi privilegi admin'
                            : 'Promuovi ad admin'
                        }
                        className="rounded-md border border-ink-line bg-white p-1.5 text-ink-soft transition hover:text-ink disabled:opacity-30"
                      >
                        {busyId === u.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteUser(u)}
                        disabled={u.id === currentUserId || busyId === u.id}
                        title="Elimina utente"
                        className="rounded-md border border-ink-line bg-white p-1.5 text-ink-soft transition hover:border-red-300 hover:text-red-600 disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <CreateUserModal
          onClose={() => setModalOpen(false)}
          onCreated={(u) => {
            addUserToList(u);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function RolePill({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-gold">
        <ShieldCheck className="h-3 w-3" /> admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-canvas-warm px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-ink-soft">
      user
    </span>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (u: AdminUser) => void;
}) {
  const [mode, setMode] = useState<'invite' | 'password'>('invite');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const full_name = String(fd.get('full_name') ?? '');
    const role = String(fd.get('role') ?? 'user') as 'user' | 'admin';
    const password = String(fd.get('password') ?? '');

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: full_name || undefined,
          role,
          mode,
          password: mode === 'password' ? password : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Errore');

      const newUser: AdminUser = {
        id: json.id,
        email: json.email,
        full_name: full_name || null,
        role: json.role,
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        email_confirmed: mode === 'password',
      };

      if (mode === 'password') {
        // Mostra le credenziali una volta sola
        setCreatedEmail(email);
        setCreatedPassword(password);
        // Inseriamo nella lista ma teniamo aperta la modal
        onCreated(newUser);
      } else {
        onCreated(newUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setLoading(false);
    }
  }

  async function copyCredentials() {
    if (!createdEmail || !createdPassword) return;
    await navigator.clipboard.writeText(
      `Email: ${createdEmail}\nPassword: ${createdPassword}\nAccedi: ${location.origin}/it/login`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-canvas-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-mute transition hover:bg-canvas-warm hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          {createdPassword ? (
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-ink">Account creato.</h3>
              <p className="text-sm text-ink-soft">
                Comunica queste credenziali al cliente. Questa è l'unica volta che le vedi.
              </p>
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                <p className="text-[10px] uppercase tracking-widest text-gold">Credenziali</p>
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs">
                    <span className="text-ink-mute">Email:</span>{' '}
                    <code className="text-ink">{createdEmail}</code>
                  </p>
                  <p className="text-xs">
                    <span className="text-ink-mute">Password:</span>{' '}
                    <code className="text-ink">{createdPassword}</code>
                  </p>
                </div>
                <button
                  onClick={copyCredentials}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-ink-line bg-white px-3 py-1.5 text-xs text-ink-soft transition hover:text-ink"
                >
                  {copied ? <Check className="h-3 w-3 text-[#2a7a5c]" /> : <Copy className="h-3 w-3" />}
                  Copia tutto
                </button>
              </div>
              <button onClick={onClose} className="btn-primary w-full justify-center">
                Chiudi
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-display text-2xl text-ink">Crea un nuovo utente</h3>

              {/* mode switch */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <ModeButton
                  active={mode === 'invite'}
                  onClick={() => setMode('invite')}
                  title="Invia invito"
                  desc="Email con link per impostare password"
                />
                <ModeButton
                  active={mode === 'password'}
                  onClick={() => setMode('password')}
                  title="Imposta password"
                  desc="Crei tu la password e la comunichi"
                />
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Field name="full_name" label="Nome e cognome" />
                <Field name="email" type="email" label="Email" required />
                {mode === 'password' && (
                  <Field name="password" type="password" label="Password iniziale" required />
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-ink-mute">
                    Ruolo
                  </span>
                  <select
                    name="role"
                    defaultValue="user"
                    className="w-full rounded-lg border border-ink-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn('btn-primary w-full justify-center', loading && 'opacity-60')}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creo...
                    </>
                  ) : (
                    'Crea account'
                  )}
                </button>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border p-3 text-left transition',
        active
          ? 'border-gold bg-gold/5'
          : 'border-ink-line bg-white hover:border-ink-soft'
      )}
    >
      <p className="text-xs font-medium text-ink">{title}</p>
      <p className="mt-0.5 text-[10px] text-ink-soft">{desc}</p>
    </button>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-ink-mute">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-lg border border-ink-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
      />
    </label>
  );
}
