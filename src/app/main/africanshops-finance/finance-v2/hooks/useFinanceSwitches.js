import { useEffect, useState } from 'react';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

/**
 * Finance kill switches as the apps see them (board F17, founder 10 Nov 2026).
 *
 * The admin dashboard can switch any money feature to MAINTENANCE or DISABLED. The gateway reports that through its readiness routes
 * (`healthy` false plus a reason), and these hooks turn it into a notice and a disabled button: the button stays on screen and says why
 * it cannot be used right now. The server enforces money-out switches too; for money-in (wallet funding) this is the gate, because the
 * Paystack popup opens in the browser before any server step.
 *
 * Reading rules: a read that fails never blocks a screen (the server still says no where it matters); values are refreshed every 20 s and
 * when the tab regains focus, so a switch flipped by an admin reaches an open screen within about half a minute.
 */

// `checkout-readiness` for people (customers, citizens); the merchant dashboards pass 'checkout-readiness/pos' (a merchant token is
// rejected on the user-only routes, found live 2026-10-20 for health-wallet).
export const READINESS_BASE = 'checkout-readiness';

const REFRESH_MS = 20000;

const FEATURE_LABEL = {
  internalTransfer: 'Sending money to another AfricanShops account',
  externalTransfer: 'Withdrawals and bank transfers',
  walletFunding: 'Funding your wallet by card',
  cardCheckout: 'Card payments',
  civicPayments: 'Civic payments',
  merchantCashout: 'Cashing out',
  refunds: 'Refunds',
  virtualCards: 'Virtual cards',
};

/** The notice for a switch, or null when it is open (or not known yet). `statuses` is the map the gateway returns. */
export function switchNotice(statuses, key) {
  const status = statuses?.[key];
  if (!status || status === 'ACTIVE') return null;
  const label = FEATURE_LABEL[key] ?? 'This feature';
  return {
    status,
    text:
      status === 'MAINTENANCE'
        ? `${label} is under maintenance. Please try again shortly.`
        : `${label} is temporarily unavailable. Please try again later.`,
  };
}

function useRefreshingGet(path, pick) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await AuthApi().get(path);
        if (alive) setValue(pick(res.data));
      } catch {
        // an unreadable switch never blocks a screen
      }
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [path]);
  return value;
}

/** Every switch resolved: { statuses } (null until read). */
export function useFinanceSwitches(base = READINESS_BASE) {
  const statuses = useRefreshingGet(`${base}/finance-switches`, (body) => body?.statuses ?? body?.data?.statuses ?? null);
  return { statuses };
}

/** Wallet-funding readiness: the switch AND the payment services behind it. `blocked` also covers a service outage. */
export function useWalletFundingReadiness(base = READINESS_BASE) {
  const readiness = useRefreshingGet(`${base}/wallet-funding`, (body) => body?.data ?? body ?? null);
  const blocked = readiness?.healthy === false;
  const message =
    readiness?.unavailableMessage ??
    (blocked ? 'Payments are temporarily unavailable. Please try again shortly.' : null);
  return { blocked, message, readiness };
}
