import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// The one bank-transfer payment option (direct transfer to the company account, confirmed by a person). The gateway routes are the same for every
// checkout: GET /manual-transfer/info, GET /manual-transfer/claims/:id, POST /manual-transfer/claims/:id/receipt. Only STARTING a claim differs
// per flow (each flow's own route makes the claim for an amount it priced itself), so that call is passed into <PayByBankTransfer />.
const unwrap = (r) => {
  const d = r?.data;
  if (d && typeof d === 'object' && 'payload' in d) return d.payload;
  if (d && typeof d === 'object' && 'data' in d) return d.data;
  return d;
};

export const fetchTransferClaim = async (id) => unwrap(await AuthApi().get(`/manual-transfer/claims/${encodeURIComponent(id)}`));
export const sendTransferReceipt = async (id, body) => unwrap(await AuthApi().post(`/manual-transfer/claims/${encodeURIComponent(id)}/receipt`, body));

/** Whether the rail is on and where to pay. `null` while loading; `{ enabled: false }` while it is off or the call fails: the option then simply does not show. */
export function useBankTransferInfo() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    let live = true;
    AuthApi().get('/manual-transfer/info').then((r) => live && setInfo(unwrap(r))).catch(() => live && setInfo({ enabled: false }));
    return () => { live = false; };
  }, []);
  return info;
}

const DONE = ['COMPLETED', 'REJECTED'];

/** A claim, refreshed every 15 s while it can still change. `setClaim` lets the screen apply an answer it already has. */
export function useTransferClaim(id) {
  const [claim, setClaim] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const c = await fetchTransferClaim(id);
      setClaim(c);
      setError('');
    } catch (e) {
      setError(e?.response?.status === 404 ? 'We could not find this request.' : 'We could not refresh the status. Retrying…');
    }
  }, [id]);

  useEffect(() => {
    setClaim(null);
    load();
  }, [load]);

  useEffect(() => {
    clearInterval(timer.current);
    if (!id || DONE.includes(claim?.status)) return undefined;
    timer.current = setInterval(load, 15000);
    return () => clearInterval(timer.current);
  }, [id, claim?.status, load]);

  return { claim, setClaim, error, reload: load };
}
