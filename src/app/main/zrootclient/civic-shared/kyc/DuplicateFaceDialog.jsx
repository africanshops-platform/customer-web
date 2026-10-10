import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import FaceRetouchingOffIcon from '@mui/icons-material/FaceRetouchingOff';

/** HTTP status auth-service returns when a captured face already belongs to another account (one face, one account). */
export const DUPLICATE_FACE_STATUS = 409;

export const DUPLICATE_FACE_TITLE = 'This face is already registered';
export const DUPLICATE_FACE_BODY =
  'This face is already linked to another AfricanShops account, and each person can verify only one account. ' +
  'If that account is yours, please sign in to it. If you think this is a mistake, contact support.';

/** True when a failed face submission was refused because the face already belongs to another account. */
export function isDuplicateFaceError(err) {
  return err?.response?.status === DUPLICATE_FACE_STATUS;
}

/**
 * Pop-up shown when a face capture is refused as a duplicate. Deliberately never says WHICH account matched.
 * Same wording as the civic-mobile / customer-mobile DuplicateFaceModal so the experience is identical everywhere.
 */
export default function DuplicateFaceDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="duplicate-face-title"
      PaperProps={{ sx: { bgcolor: '#0b1626', color: '#fff', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' } }}
    >
      <DialogTitle id="duplicate-face-title" sx={{ textAlign: 'center', pt: 3 }}>
        <Box
          sx={{
            width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 1.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(245,158,11,0.15)', color: '#fbbf24',
          }}
        >
          <FaceRetouchingOffIcon />
        </Box>
        <Typography component="span" sx={{ display: 'block', fontWeight: 700, fontSize: '1.15rem' }}>
          {DUPLICATE_FACE_TITLE}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', textAlign: 'center' }}>
          {DUPLICATE_FACE_BODY}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          variant="contained"
          onClick={onClose}
          autoFocus
          sx={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: 2.5, fontWeight: 700, px: 4 }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
