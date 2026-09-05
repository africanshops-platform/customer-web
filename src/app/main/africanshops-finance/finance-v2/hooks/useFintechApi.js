import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// Backend uses either `payload` or `data` depending on the route.
//
// Bug fix (2026-09-02): checking `.payload` with `??` treated an explicit
// `payload: null` the same as the key being absent — but for my-account,
// `payload: null` is the normal, expected response for a user with no
// fintech wallet yet. `??` fell through past it to `.data` (absent) and
// then to the raw envelope `r.data` itself, so useMyAccount returned
// `{success:false, payload:null}` instead of null. That object is truthy
// and !== null, so FinanceShellPage's `account === null` onboarding gate
// never fired and the dashboard rendered with no real account behind it.
// Check key presence instead of value truthiness so an explicit null is
// respected — same fix already shipped on the mobile app's wallet.api.ts.
function unwrap(r) {
  const data = r.data;
  if (data && typeof data === 'object' && 'payload' in data) return data.payload;
  if (data && typeof data === 'object' && 'data' in data) return data.data;
  return data;
}

function makeHook(fetcher) {
  return function useHook(...args) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    // Retail-N (2026-07-13) bugfix: the focus/visibility refetch below (added
    // to fix stale balances) was flipping `isLoading` back to true on every
    // tab-focus, and consuming screens gate a full-page spinner on isLoading
    // (e.g. FinanceShellPage's `if (accountLoading) return <spinner/>`) — so
    // switching back to the tab looked like a full page reload. `isLoading`
    // must only be true before the FIRST fetch ever completes; every fetch
    // after that is a silent background refetch (react-query's isFetching,
    // not isLoading, semantics) — data still updates, nothing unmounts.
    const hasFetchedOnce = useRef(false);

    const fetch = useCallback(async () => {
      try {
        if (!hasFetchedOnce.current) setIsLoading(true);
        setIsFetching(true);
        setError(null);
        const result = await fetcher(...args);
        setData(result);
      } catch (err) {
        setError(err?.response?.data?.message ?? err?.message ?? 'Request failed');
      } finally {
        setIsLoading(false);
        setIsFetching(false);
        hasFetchedOnce.current = true;
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [args.map(JSON.stringify).join()]);

    useEffect(() => { fetch(); }, [fetch]);

    // react-query's refetchOnWindowFocus equivalent: refetch when the tab/
    // window regains focus (e.g. after checking a balance change from
    // another device/tab), but silently — see the isLoading note above.
    useEffect(() => {
      function onFocus() { fetch(); }
      function onVisibility() { if (document.visibilityState === 'visible') fetch(); }
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVisibility);
      return () => {
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }, [fetch]);

    return { data, isLoading, isFetching, error, refetch: fetch };
  };
}

export const useMyAccount = makeHook(() =>
  AuthApi().get('/fintech-accounts/user/account/my-account').then(r => unwrap(r) ?? null)
);

export const useBalance = makeHook((currency = 'NGN') =>
  AuthApi().get(`/fintech-accounts/user/balance?currency=${currency}`).then(r => unwrap(r))
);

export const useStatement = makeHook((params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return AuthApi().get(`/fintech-accounts/user/statement${q ? `?${q}` : ''}`).then(r => unwrap(r));
});

export const useTransactionHistory = makeHook((params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return AuthApi().get(`/fintech-accounts/user/transaction/history${q ? `?${q}` : ''}`).then(r => unwrap(r));
});

export const useSavingsBalance = makeHook((accountNumber) =>
  accountNumber
    ? AuthApi().get(`/fintech-accounts/user/account/${accountNumber}/savings/balance`).then(r => unwrap(r))
    : Promise.resolve(null)
);

export const useWallets = makeHook((accountNumber) =>
  accountNumber
    ? AuthApi().get(`/fintech-accounts/user/account/${accountNumber}/wallets`).then(r => unwrap(r))
    : Promise.resolve(null)
);

export const useFxRates = makeHook(() =>
  AuthApi().get('/fintech-accounts/fx/rates').then(r => unwrap(r)?.rates ?? [])
);

export const useKycStatus = makeHook(() =>
  AuthApi().get('/auth-user/kyc/status').then(r => unwrap(r))
);

// Identity KYC 3-document flow (2026-08-11) — a SEPARATE system from the
// civic/biometric useKycStatus above (that one is /auth-user/kyc/*, face-api.js
// + WebAuthn). This is National ID/BVN-NIN/Utility Bill, gating fintech money
// movement, backed by zxfx-fintech-service's identityKycSubmissions. Named
// useFintechKycStatus specifically to avoid confusion with useKycStatus.
export const useFintechKycStatus = makeHook((accountNumber) =>
  accountNumber
    ? AuthApi().get(`/fintech-accounts/user/account/${accountNumber}/kyc/status`).then(r => unwrap(r))
    : Promise.resolve(null)
);

export const useBeneficiaries = makeHook((accountNumber) =>
  accountNumber
    ? AuthApi().get(`/fintech-accounts/user/beneficiary/list/${accountNumber}`).then(r => unwrap(r) ?? [])
    : Promise.resolve([])
);

// Public, unauthenticated Paystack passthrough routes (no guard on the gateway) —
// same ones already used by the shop-dashboard's LinkBankAccountDialog.
//
// DEV-ONLY (remove before shipping): Paystack's live test-mode key allows only
// 3 real bank-account resolves/day. bank_code 001 + account 0000000000 is
export const useBanksList = makeHook(() =>
  AuthApi().get('/fintech-accounts/paystack-api/banks/list?country=nigeria&perPage=100').then(r => unwrap(r) ?? [])
);

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateFintechAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/account/create', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Account creation failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/transaction/transfer', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Transfer failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useSubmitNationalId() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async ({ accountNumber, nationalIdNumber, nationalIdImageUrl }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/kyc/national-id`, {
        nationalIdNumber,
        nationalIdImageUrl,
      });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not submit National ID';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useSubmitIdentity() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async ({ accountNumber, identityType, identityNumber }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/kyc/identity`, {
        identityType,
        identityNumber,
      });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not verify BVN/NIN';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useSubmitUtilityBill() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async ({ accountNumber, utilityBillImageUrl }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/kyc/utility-bill`, {
        utilityBillImageUrl,
      });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not submit utility bill';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useResolveAccountNumber() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async ({ accountNumber, bankCode }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/paystack-api/verify-account-number', {
        account_number: accountNumber,
        bank_code: bankCode,
      });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not resolve account. Check the number and bank.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

/**
 * Retail-N (2026-07-13): resolves an internal (platform) account number to
 * its holder's name before a transfer is confirmed — no money movement.
 * Callers should debounce and only invoke once a full account number is typed.
 */
export function useResolveInternalAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().get(`/fintech-accounts/user/account/resolve/${accountNumber}`);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Account not found';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useAddBeneficiary() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/beneficiary/add', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not add beneficiary';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useDeleteBeneficiary() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (beneficiaryId, accountNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().delete(`/fintech-accounts/user/beneficiary/${beneficiaryId}/delete?accountNumber=${accountNumber}`);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not remove beneficiary';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useRequestPinReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/account/pin/forgot/initiate');
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not send reset code';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useConfirmPinReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/account/pin/forgot/confirm', payload);
      return unwrap(res);
    } catch (err) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.message ?? 'Could not reset PIN';
      if (status === 410) msg = 'Code expired. Please start again.';
      if (status === 429) msg = 'Too many attempts. Please start again.';
      setError(msg);
      throw Object.assign(new Error(msg), { status });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Retail-7 (2026-07-12): change PIN (knows current PIN) + self-service transfer limits
export function useChangePin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber, payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().put(`/fintech-accounts/user/account/${accountNumber}/change-pin`, payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not change PIN';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export const useTransferLimits = makeHook((accountNumber) =>
  accountNumber
    ? AuthApi().get(`/fintech-accounts/user/account/${accountNumber}/transfer-limits`).then(r => unwrap(r))
    : Promise.resolve(null)
);

export function useSetTransferLimits() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber, payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().put(`/fintech-accounts/user/account/${accountNumber}/transfer-limits`, payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not update transfer limits';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Retail-8 (2026-07-12): fund default wallet via card checkout (react-paystack
// inline popup, same component already used on bookings/marketplace/foodmart)
export function useVerifyWalletFunding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber, reference) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/fund/verify`, { reference });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not confirm payment';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useProvisionMyDva() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/provision-dva`);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not set up receive-money account';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useWithdrawalInitiate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/withdrawal/initiate', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Withdrawal initiation failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useWithdrawalConfirm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/withdrawal/confirm', payload);
      return unwrap(res);
    } catch (err) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.message ?? 'Confirmation failed';
      if (status === 410) msg = 'OTP expired. Please start a new withdrawal.';
      if (status === 429) msg = 'Too many attempts. Withdrawal cancelled.';
      setError(msg);
      throw Object.assign(new Error(msg), { status });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useExternalTransferInitiate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/transfer/external/initiate', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Transfer initiation failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useExternalTransferConfirm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/transfer/external/confirm', payload);
      return unwrap(res);
    } catch (err) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.message ?? 'Confirmation failed';
      if (status === 410) msg = 'OTP expired. Please start a new transfer.';
      if (status === 429) msg = 'Too many attempts. Transfer cancelled.';
      setError(msg);
      throw Object.assign(new Error(msg), { status });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useOpenSavings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/savings/open`);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Failed to open savings account';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Retail-6 (2026-07-12): High-Yield vault fund/withdraw + rate
export function useFundHighYield() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber, amountKobo, transactionPin) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/high-yield/fund`, { amountKobo, transactionPin });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Failed to fund High-Yield savings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useWithdrawHighYield() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber, amountKobo, transactionPin) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/high-yield/withdraw`, { amountKobo, transactionPin });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Failed to withdraw from High-Yield savings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export const useHighYieldRate = makeHook(() =>
  AuthApi().get('/fintech-accounts/high-yield/rate').then(r => unwrap(r))
);

export function useOpenWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber, currency) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/wallets/open`, { currency });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Failed to open wallet';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useCrossCurrencyTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/transaction/cross-currency-transfer', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Transfer failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export const CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'XOF', 'XAF', 'EGP', 'MAD'];

export const CURRENCY_SYMBOLS = {
  NGN: '₦', GHS: '₵', KES: 'KSh', ZAR: 'R',
  UGX: 'USh', TZS: 'TSh', XOF: 'CFA', XAF: 'FCFA',
  EGP: 'E£', MAD: 'MAD',
};

export function formatKobo(kobo, currency = 'NGN') {
  if (kobo == null) return '—';
  const amount = parseFloat(kobo) / 100;
  return `${CURRENCY_SYMBOLS[currency] ?? currency} ${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNaira(naira, currency = 'NGN') {
  if (naira == null) return '—';
  const amount = parseFloat(naira);
  return `${CURRENCY_SYMBOLS[currency] ?? currency} ${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
