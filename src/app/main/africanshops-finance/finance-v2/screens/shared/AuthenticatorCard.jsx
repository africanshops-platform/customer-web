import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { F } from '../../financeUiTokens';
import { getApiAuthUser, setup2fa, confirm2fa, disable2fa, setProtectAll } from 'app/configs/data/client/RepositoryAuthClient';
import { isSixDigits, isValidLoginCode, stepUpErrorMessage } from 'app/configs/data/stepUp/stepUp';
import CodeBoxes from 'app/configs/data/stepUp/CodeBoxes';
import CodeEntry from 'app/configs/data/stepUp/CodeEntry';
import { PendingButton, ProcessingState, SectionSkeleton } from 'app/shared-components/loading';
import AuthenticatorAppHelp from 'app/configs/data/stepUp/AuthenticatorAppHelp';

const profileOf = (res) => {
  const d = res?.data;
  return d?.user ?? d?.payload?.user ?? d?.data?.user ?? d?.payload ?? d ?? {};
};

/**
 * F30: the authenticator app. Turn it on (scan, confirm with a code, save the backup codes once), choose "protect all my transactions",
 * turn it off with the password. Payments of N1,000,000 or more (and every payment, when protect-all is on) then ask for a code.
 */
export default function AuthenticatorCard({ tokens, card }) {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery(['me-authenticator'], async () => profileOf(await getApiAuthUser()), { staleTime: 15000 });
  const [setup, setSetup] = useState(null); // { secret, qrCodeDataUrl }
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [saved, setSaved] = useState(false);
  const [turningOff, setTurningOff] = useState(false);
  const [password, setPassword] = useState('');
  const [offCode, setOffCode] = useState('');
  const [busy, setBusy] = useState(''); // which action is running: 'start' | 'confirm' | 'protect' | 'off'
  const [error, setError] = useState('');

  const enabled = !!profile?.twoFactorEnabled;
  const refresh = () => qc.invalidateQueries(['me-authenticator']);
  const run = async (fn, action) => {
    setBusy(action);
    setError('');

    try {
      await fn();
    } catch (e) {
      setError(stepUpErrorMessage(e));
    } finally {
      setBusy('');
    }
  };

  const start = () => run(async () => setSetup((await setup2fa()).data), 'start');
  const confirm = () =>
    run(async () => {
      const res = await confirm2fa(code.trim());

      setBackupCodes(res.data?.backupCodes ?? []);
      setSetup(null);
      setCode('');
      refresh();
    }, 'confirm');
  const toggleProtect = (checked) =>
    run(async () => {
      await setProtectAll(checked);
      refresh();
    }, 'protect');
  const turnOff = () =>
    run(async () => {
      await disable2fa({ password, totpCode: offCode.trim() });
      setTurningOff(false);
      setPassword('');
      setOffCode('');
      refresh();
    }, 'off');

  const downloadCodes = () => {
    const url = URL.createObjectURL(new Blob([`AfricanShops backup codes\n\n${backupCodes.join('\n')}\n\nEach code works once.\n`], { type: 'text/plain' }));
    const a = document.createElement('a');

    a.href = url;
    a.download = 'africanshops-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl p-24" style={card}>
      <div className="flex items-center gap-12 mb-16">
        <div className="w-40 h-40 rounded-xl flex items-center justify-center" style={{ background: tokens.accentSoft }}>
          <FuseSvgIcon size={20} style={{ color: tokens.accentSolid }}>heroicons-outline:shield-check</FuseSvgIcon>
        </div>
        <div>
          <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>Authenticator app</Typography>
          <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>A code from your phone approves large payments and protects sign-in</Typography>
        </div>
      </div>

      {isLoading && <SectionSkeleton variant="form" />}

      {error && <Alert severity="error" className="mb-12">{error}</Alert>}

      {backupCodes && (
        <div>
          <Alert severity="warning" className="mb-12">
            Authenticator is on. Save these backup codes now: they are shown once. Each works one time if you lose your phone.
          </Alert>
          <pre style={{ fontSize: 16, lineHeight: 1.8, background: tokens.accentSoft, padding: 12, borderRadius: 12 }}>{backupCodes.join('\n')}</pre>
          <div className="flex gap-12 my-12">
            <Button variant="outlined" onClick={downloadCodes}>Download</Button>
            <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(backupCodes.join('\n'))}>Copy</Button>
          </div>
          <FormControlLabel control={<Checkbox checked={saved} onChange={(e) => setSaved(e.target.checked)} />} label="I have saved my backup codes" />
          <div>
            <Button variant="contained" disabled={!saved} onClick={() => { setBackupCodes(null); setSaved(false); }}>Done</Button>
          </div>
        </div>
      )}

      {!backupCodes && !isLoading && !enabled && !setup && (
        <PendingButton variant="contained" onClick={start} pending={busy === 'start'} pendingLabel="Starting…" disabled={!!busy}>Turn on</PendingButton>
      )}

      {!backupCodes && setup && (
        <div>
          <AuthenticatorAppHelp textColor={tokens.textPrimary} mutedColor={tokens.textSecondary} accentSoft={tokens.accentSoft} />
          {setup.qrCodeDataUrl && <img src={setup.qrCodeDataUrl} alt="Authenticator QR code" width={180} height={180} />}
          <Typography style={{ fontSize: F.small, color: tokens.textMuted, wordBreak: 'break-all' }} className="my-8">
            Cannot scan? Enter this key by hand: <b>{setup.secret}</b>
          </Typography>
          {/* One fixed-height area, so the card never jumps: the boxes while typing, the branded spiral while the code is checked. */}
          <div style={{ minHeight: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {busy === 'confirm' ? <ProcessingState title="Checking your code" subtitle="" /> : <CodeBoxes value={code} onChange={setCode} autoFocus />}
          </div>
          <div className="flex gap-12 mt-16">
            <PendingButton variant="contained" onClick={confirm} pending={busy === 'confirm'} pendingLabel="Checking…" disabled={!isSixDigits(code) || (!!busy && busy !== 'confirm')}>Confirm</PendingButton>
            <Button onClick={() => { setSetup(null); setCode(''); setError(''); }}>Cancel</Button>
          </div>
        </div>
      )}

      {!backupCodes && !isLoading && enabled && (
        <div>
          <Alert severity="success" className="mb-12">Authenticator is on. Payments of ₦1,000,000 or more ask for a code.</Alert>
          <FormControlLabel
            control={<Switch checked={!!profile?.protectAllTransactions} onChange={(e) => toggleProtect(e.target.checked)} disabled={!!busy} />}
            label="Protect all my transactions (ask for a code on every payment)"
          />
          {!turningOff ? (
            <div className="mt-12">
              <Button color="error" onClick={() => setTurningOff(true)}>Turn off</Button>
            </div>
          ) : (
            <div className="mt-12">
              <Typography style={{ fontSize: F.small, color: tokens.textSecondary }} className="mb-8">
                To turn it off, enter your password and a current code from the app (or one of your backup codes).
              </Typography>
              <div className="flex flex-wrap gap-12">
                <TextField size="small" type="password" label="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              <div className="my-12">
                <CodeEntry value={offCode} onChange={setOffCode} onSubmit={() => password && isValidLoginCode(offCode) && turnOff()} disabled={!!busy} />
              
              </div>
              <div className="flex gap-12 mt-12">
                <PendingButton color="error" variant="contained" onClick={turnOff} pending={busy === 'off'} pendingLabel="Turning off…" disabled={!password || !isValidLoginCode(offCode) || (!!busy && busy !== 'off')}>Turn off</PendingButton>
                <Button onClick={() => { setTurningOff(false); setPassword(''); setOffCode(''); setError(''); }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
