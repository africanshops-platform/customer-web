import Drawer from '@mui/material/Drawer';
import { useFinanceTheme } from '../../FinanceThemeContext';

/** A panel that slides in from the right, as used for "Open a wallet" and "New plan": title, subtitle, a round close button. */
export default function SlidePanel({ open, title, subtitle, onClose, children }) {
  const { tokens } = useFinanceTheme();
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={320}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, borderTopLeftRadius: 28, borderBottomLeftRadius: 28, overflow: 'hidden', background: tokens.cardBg, color: tokens.textPrimary } }}
      slotProps={{ backdrop: { sx: { background: 'rgba(20,16,8,0.45)', backdropFilter: 'blur(3px)' } } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '22px 26px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</div>
            <div style={{ fontSize: 13, color: tokens.textSecondary }}>{subtitle}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, borderRadius: '50%', border: 0, background: tokens.borderColor, color: tokens.textPrimary, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 26px 22px' }}>{children}</div>
      </div>
    </Drawer>
  );
}
