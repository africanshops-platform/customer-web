import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import { useFinanceTheme } from '../FinanceThemeContext';
import { useWalletBeneficiaries, useWalletBeneficiaryActions, useResolveInternalAccount } from '../hooks/useFintechApi';
import PillSwitch from './shared/PillSwitch';
import { colorFor, initials } from './shared/RecipientPicker';

// Beneficiaries, as in the approved preview: accounts you send to, grouped under a person's name (Groups) or listed
// flat (All accounts). Wallet-to-wallet only; bank beneficiaries stay on the Send to Bank and Withdraw screens.

function Avatar({ name, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#fff', flex: 'none', background: colorFor(name), fontSize: size * 0.36 }}>
      {initials(name)}
    </div>
  );
}

function Mark({ text, q }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: '#ffe3c2', borderRadius: 3, color: 'inherit' }}>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Tag({ children, tone, tokens }) {
  const [bg, fg] = { accent: [tokens.accentSoft, tokens.accentSolid], info: [tokens.infoBg, tokens.info] }[tone ?? 'info'];
  return <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: bg, color: fg }}>{children}</span>;
}

export default function FinanceBeneficiariesContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const { data, isLoading, refetch } = useWalletBeneficiaries(account?.accountNumber);
  const actions = useWalletBeneficiaryActions(account?.accountNumber);
  const { mutate: resolveAccount } = useResolveInternalAccount();

  const [tab, setTab] = useState('groups');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState({});
  const [dialog, setDialog] = useState(null); // { type: 'add' | 'group' | 'rename-group' | 'move' | 'nickname', ... }
  const [field, setField] = useState({ number: '', nickname: '', group: 'none', name: '' });
  const [resolved, setResolved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const all = useMemo(() => data?.beneficiaries ?? [], [data]);
  const groups = useMemo(() => data?.groups ?? [], [data]);
  const low = q.trim().toLowerCase();
  const match = (b) => !low || b.accountName.toLowerCase().includes(low) || b.accountNumber.includes(q.trim()) || (b.nickname ?? '').toLowerCase().includes(low);
  const shownGroups = groups.map((g) => ({ ...g, accounts: g.accounts.filter(match) })).filter((g) => !low || g.accounts.length || g.name.toLowerCase().includes(low));
  const shownUngrouped = (data?.ungrouped ?? []).filter(match);
  const shownAll = all.filter(match);

  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20 };
  const pBtn = { padding: '11px 20px', borderRadius: 14, fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer', background: tokens.accentGradient, color: '#fff', boxShadow: `0 6px 16px ${tokens.accentSolid}44` };
  const oBtn = { padding: '11px 20px', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, color: tokens.textPrimary };
  const sBtn = { border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, padding: '6px 12px', fontWeight: 700, fontSize: 12, background: tokens.cardBg, color: tokens.textPrimary, cursor: 'pointer' };
  const input = { width: '100%', border: `2px solid ${tokens.borderColor}`, borderRadius: 14, padding: '12px 14px', fontSize: 15, background: tokens.cardBg, color: tokens.textPrimary, outline: 'none' };

  function openDialog(d) {
    setErr('');
    setResolved(null);
    setField({ number: '', nickname: d.nickname ?? '', group: d.groupId ?? 'none', name: d.name ?? '' });
    setDialog(d);
  }
  async function run(fn) {
    setBusy(true);
    setErr('');
    try {
      await fn();
      setDialog(null);
      await refetch();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function onNumber(v) {
    const n = v.replace(/\D/g, '').slice(0, 10);
    setField((f) => ({ ...f, number: n }));
    setResolved(null);
    setErr('');
    if (n.length === 10) {
      try { setResolved(await resolveAccount(n)); } catch { setErr('No account found with that number.'); }
    }
  }

  function accountRow(b, last) {
    return (
      <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: last ? 0 : `1px dashed ${tokens.borderColor}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ display: 'block', fontSize: 14, color: tokens.textPrimary }}><Mark text={b.accountNumber} q={q.trim()} /></b>
          <span style={{ fontSize: 12.5, color: tokens.textSecondary }}>{b.nickname ? `"${b.nickname}"` : 'AfricanShops wallet'}</span>
        </div>
        <Link to={`/africanshops/finance-v2/transfer?to=${b.accountNumber}`} style={{ ...sBtn, background: tokens.accentGradient, color: '#fff', border: 0, textDecoration: 'none' }}>Send</Link>
        <button type="button" style={sBtn} onClick={() => openDialog({ type: 'move', id: b.id, groupId: b.groupId })}>Move</button>
        <button type="button" style={sBtn} onClick={() => openDialog({ type: 'nickname', id: b.id, nickname: b.nickname })}>Name</button>
        <button type="button" style={{ ...sBtn, color: tokens.danger }} onClick={() => openDialog({ type: 'remove', id: b.id, label: b.accountNumber })}>Remove</button>
      </div>
    );
  }

  const emptyAll = !isLoading && all.length === 0;

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <PillSwitch
          value={tab}
          onChange={setTab}
          options={[{ key: 'groups', label: 'Groups', count: groups.length }, { key: 'all', label: 'All accounts', count: all.length }]}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={oBtn} onClick={() => openDialog({ type: 'group' })}>＋ New group</button>
          <button type="button" style={pBtn} onClick={() => openDialog({ type: 'add' })}>＋ Add account</button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.textMuted} strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or account number" aria-label="Search beneficiaries" style={{ ...input, padding: '14px 16px 14px 44px', fontSize: 16 }} />
      </div>

      {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={76} sx={{ mb: 1.5, borderRadius: '20px' }} />)}

      {emptyAll && (
        <div style={{ ...card, padding: 36, textAlign: 'center', color: tokens.textSecondary }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
          <b style={{ color: tokens.textPrimary, fontSize: 17 }}>No beneficiaries yet</b>
          <p style={{ margin: '6px 0 16px' }}>Save the people you send to, and group their accounts under their name. After a transfer you can save the account, or add one here.</p>
          <button type="button" style={pBtn} onClick={() => openDialog({ type: 'add' })}>＋ Add account</button>
        </div>
      )}

      {!isLoading && !emptyAll && tab === 'groups' && (
        <>
          {shownGroups.map((g, i) => {
            const isOpen = open[g.id] ?? i === 0;
            return (
              <div key={g.id} style={{ ...card, marginBottom: 12, overflow: 'hidden' }}>
                <div role="button" tabIndex={0} onClick={() => setOpen((o) => ({ ...o, [g.id]: !isOpen }))} onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => ({ ...o, [g.id]: !isOpen }))} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', cursor: 'pointer' }}>
                  <Avatar name={g.name} />
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 16, color: tokens.textPrimary }}><Mark text={g.name} q={q.trim()} /></b>
                    <span style={{ display: 'block', color: tokens.textSecondary, fontSize: 13 }}>{g.accounts.length} account{g.accounts.length === 1 ? '' : 's'} saved</span>
                  </div>
                  <span style={{ color: tokens.textMuted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>⌄</span>
                </div>
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${tokens.borderColor}`, padding: '6px 16px 12px', background: tokens.pageBg }}>
                    {g.accounts.map((b, k) => accountRow(b, k === g.accounts.length - 1))}
                    {g.accounts.length === 0 && <div style={{ padding: '12px 0', color: tokens.textMuted, fontSize: 13 }}>No accounts in this group yet.</div>}
                    <div style={{ display: 'flex', gap: 8, paddingTop: 10 }}>
                      <button type="button" style={sBtn} onClick={() => openDialog({ type: 'add', groupId: g.id })}>＋ Add another account for {g.name.split(' ')[0]}</button>
                      <button type="button" style={sBtn} onClick={() => openDialog({ type: 'rename-group', id: g.id, name: g.name })}>Rename group</button>
                      <button type="button" style={{ ...sBtn, color: tokens.danger }} onClick={() => openDialog({ type: 'delete-group', id: g.id, label: g.name })}>Delete group</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {shownUngrouped.length > 0 && (
            <div style={{ ...card, padding: '14px 16px' }}>
              <b style={{ color: tokens.textPrimary }}>Not in a group</b>
              <span style={{ display: 'block', color: tokens.textSecondary, fontSize: 13, marginBottom: 4 }}>Use Move to put an account under a person's name.</span>
              {shownUngrouped.map((b) => (
                <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar name={b.accountName} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 14, color: tokens.textPrimary }}><Mark text={b.accountName} q={q.trim()} /></b>
                    <div style={{ fontSize: 12.5, color: tokens.textSecondary }}>{b.accountNumber}</div>
                  </div>
                  <div style={{ flex: 'none' }}>{rowActions(b)}</div>
                </div>
              ))}
            </div>
          )}
          {shownGroups.length === 0 && shownUngrouped.length === 0 && <div style={{ ...card, padding: 24, textAlign: 'center', color: tokens.textMuted }}>No beneficiaries match.</div>}
        </>
      )}

      {!isLoading && !emptyAll && tab === 'all' && (
        <>
          {shownAll.map((b) => (
            <div key={b.id} style={{ ...card, marginBottom: 10, padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar name={b.accountName} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ color: tokens.textPrimary }}><Mark text={b.accountName} q={q.trim()} /></b>
                <span style={{ display: 'block', color: tokens.textSecondary, fontSize: 13 }}><Mark text={b.accountNumber} q={q.trim()} />{b.nickname ? ` · "${b.nickname}"` : ''}</span>
              </div>
              <Tag tone={b.groupId ? 'accent' : 'info'} tokens={tokens}>{b.groupId ? 'In a group' : 'Ungrouped'}</Tag>
              {rowActions(b)}
            </div>
          ))}
          {shownAll.length === 0 && <div style={{ ...card, padding: 24, textAlign: 'center', color: tokens.textMuted }}>No beneficiaries match.</div>}
        </>
      )}

      <Dialog open={!!dialog} onClose={() => !busy && setDialog(null)} PaperProps={{ sx: { borderRadius: '20px', p: 1, width: 440, maxWidth: '92vw', background: tokens.cardBg } }}>
        {dialog && (
          <div style={{ padding: 20, color: tokens.textPrimary }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>
              {{ add: 'Add an account', group: 'New group', 'rename-group': 'Rename group', move: 'Move to a group', nickname: 'Name this account', remove: 'Remove this account?', 'delete-group': 'Delete this group?' }[dialog.type]}
            </h3>

            {dialog.type === 'add' && (
              <>
                <input value={field.number} onChange={(e) => onNumber(e.target.value)} inputMode="numeric" placeholder="10-digit account number" aria-label="Account number" style={input} />
                {resolved && <div style={{ marginTop: 10, background: tokens.successBg, color: tokens.success, borderRadius: 14, padding: '10px 12px', fontSize: 14 }}>✔ {resolved.accountName} (name confirmed)</div>}
                <input value={field.nickname} onChange={(e) => setField((f) => ({ ...f, nickname: e.target.value }))} placeholder="Nickname (optional)" aria-label="Nickname" style={{ ...input, marginTop: 10 }} />
                <select value={dialog.groupId ?? field.group} onChange={(e) => setField((f) => ({ ...f, group: e.target.value }))} disabled={!!dialog.groupId} aria-label="Group" style={{ ...input, marginTop: 10 }}>
                  <option value="none">No group</option>
                  <option value="new">New group named after the account</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </>
            )}
            {(dialog.type === 'group' || dialog.type === 'rename-group') && <input value={field.name} onChange={(e) => setField((f) => ({ ...f, name: e.target.value }))} placeholder="Group name (a person's name works best)" aria-label="Group name" maxLength={60} style={input} />}
            {dialog.type === 'nickname' && <input value={field.nickname} onChange={(e) => setField((f) => ({ ...f, nickname: e.target.value }))} placeholder="Nickname" aria-label="Nickname" maxLength={40} style={input} />}
            {dialog.type === 'move' && (
              <select value={field.group} onChange={(e) => setField((f) => ({ ...f, group: e.target.value }))} aria-label="Group" style={input}>
                <option value="none">No group</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            )}
            {(dialog.type === 'remove' || dialog.type === 'delete-group') && (
              <p style={{ margin: 0, color: tokens.textSecondary }}>
                {dialog.type === 'remove' ? `${dialog.label} will no longer be in your beneficiaries. You can add it again later.` : `${dialog.label} is deleted; its accounts stay in your beneficiaries, ungrouped.`}
              </p>
            )}

            {err && <div style={{ marginTop: 12, background: tokens.dangerBg, color: tokens.danger, borderRadius: 14, padding: '10px 12px', fontSize: 14 }}>{err}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button type="button" style={oBtn} disabled={busy} onClick={() => setDialog(null)}>Cancel</button>
              <button
                type="button"
                style={{ ...pBtn, minWidth: 110 }}
                disabled={busy || (dialog.type === 'add' && !resolved) || ((dialog.type === 'group' || dialog.type === 'rename-group') && !field.name.trim())}
                onClick={() => {
                  if (dialog.type === 'add') {
                    const dto = { beneficiaryAccountNumber: field.number, nickname: field.nickname || undefined };
                    const gid = dialog.groupId ?? field.group;
                    if (gid === 'new') dto.groupName = resolved.accountName;
                    else if (gid && gid !== 'none') dto.groupId = gid;
                    run(() => actions.add(dto));
                  } else if (dialog.type === 'group') run(() => actions.createGroup(field.name));
                  else if (dialog.type === 'rename-group') run(() => actions.renameGroup(dialog.id, field.name));
                  else if (dialog.type === 'nickname') run(() => actions.update(dialog.id, { nickname: field.nickname }));
                  else if (dialog.type === 'move') run(() => actions.update(dialog.id, { groupId: field.group === 'none' ? null : field.group }));
                  else if (dialog.type === 'remove') run(() => actions.remove(dialog.id));
                  else if (dialog.type === 'delete-group') run(() => actions.deleteGroup(dialog.id));
                }}
              >
                {busy ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : { add: 'Save', group: 'Create', 'rename-group': 'Rename', move: 'Move', nickname: 'Save', remove: 'Remove', 'delete-group': 'Delete' }[dialog.type]}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );

  function rowActions(b) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <Link to={`/africanshops/finance-v2/transfer?to=${b.accountNumber}`} style={{ ...sBtn, background: tokens.accentGradient, color: '#fff', border: 0, textDecoration: 'none' }}>Send</Link>
        <button type="button" style={sBtn} onClick={() => openDialog({ type: 'move', id: b.id, groupId: b.groupId })}>Move</button>
        <button type="button" style={{ ...sBtn, color: tokens.danger }} onClick={() => openDialog({ type: 'remove', id: b.id, label: b.accountNumber })}>Remove</button>
      </div>
    );
  }
}
