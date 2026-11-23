import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

export const KYC_STATUS_KEY = ['kyc-status'];

// ─── raw API calls ────────────────────────────────────────────────────────────
const api = {
  getStatus:           ()  => AuthApi().get('/auth-user/kyc/status'),
  submitFace:          (b) => AuthApi().post('/auth-user/kyc/face', b),
  submitDocument:      (b) => AuthApi().post('/auth-user/kyc/document', b),
  verifyFace:          (b) => AuthApi().post('/auth-user/kyc/face/verify', b),
  webauthnRegOptions:  ()  => AuthApi().get('/auth-user/kyc/webauthn/register/options'),
  webauthnRegVerify:   (b) => AuthApi().post('/auth-user/kyc/webauthn/register/verify', b),
  webauthnAuthOptions: (b) => AuthApi().post('/auth-user/kyc/webauthn/auth/options', b),
  webauthnAuthVerify:  (b) => AuthApi().post('/auth-user/kyc/webauthn/auth/verify', b),
};

// ─── hooks ────────────────────────────────────────────────────────────────────

export function useGetKycStatus() {
  return useQuery(KYC_STATUS_KEY, api.getStatus, {
    // A guest has no session: the 401 would reset it and reload the page (found by the 23 Nov 2026 guest-page sweep on /account/kyc).
    enabled: Boolean(localStorage.getItem('jwt_access_token')),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    // Don't hammer the backend on server errors — one retry is enough
    retry: (failureCount, error) => {
      if (error?.response?.status >= 500) return false;
      return failureCount < 1;
    },
    select: (res) => res.data,
  });
}

function useKycMutation(fn) {
  const qc = useQueryClient();
  return useMutation(fn, {
    onSuccess: () => qc.invalidateQueries(KYC_STATUS_KEY),
  });
}

export const useSubmitFace            = () => useKycMutation(api.submitFace);
export const useSubmitDocument        = () => useKycMutation(api.submitDocument);
export const useVerifyWebAuthnReg     = () => useKycMutation(api.webauthnRegVerify);

export const useVerifyFace            = () => useMutation(api.verifyFace);
export const useGetWebAuthnRegOptions = () => useMutation(api.webauthnRegOptions);
export const useGetWebAuthnAuthOptions= () => useMutation(api.webauthnAuthOptions);
export const useVerifyWebAuthnAuth    = () => useMutation(api.webauthnAuthVerify);

// ─── Cloudinary document image upload ────────────────────────────────────────
export async function uploadDocumentImage(file) {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and ' +
      'VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.'
    );
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Document image upload failed. Please try again.');
  }
  return data.secure_url;
}
