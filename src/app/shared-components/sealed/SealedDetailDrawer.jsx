import { Box, Chip, Divider, Drawer, IconButton, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

const rise = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const ngn = (n) =>
  `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const shortDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

const card = { bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 3, p: 2 };

/**
 * Read-only detail of one finished (settled and sealed) trade, in a slider from the right. It shows what the customer paid and when:
 * never the platform's commission or the merchant's settlement (the platform fee is not itemised to users).
 * detail = { title, subtitle, image, badge, headline: { label, value }, timeline: [{ label, date }],
 *   sections: [{ title, rows: [{ label, value, strong }] }], items: [{ name, qty, amount }], note }
 */
export default function SealedDetailDrawer({ open, onClose, detail }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 440 }, maxWidth: "100%", bgcolor: "#faf7f4" } }}
    >
      {detail && (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)", color: "white", p: 2.5, pb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
              <Chip
                size="small"
                icon={<CheckCircleIcon sx={{ color: "white !important", fontSize: 16 }} />}
                label={detail.badge || "Completed · Settled"}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}
              />
              <IconButton onClick={onClose} aria-label="Close details" sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 1.5, animation: `${rise} .4s ease-out` }}>{detail.title}</Typography>
            {detail.subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.9, animation: `${rise} .4s ease-out .05s both` }}>
                {detail.subtitle}
              </Typography>
            )}
            {detail.headline && (
              <Box sx={{ mt: 1, animation: `${rise} .5s ease-out .15s both` }}>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  {detail.headline.label}
                </Typography>
                <Typography sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>{detail.headline.value}</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {detail.image && (
              <img
                src={detail.image}
                alt=""
                style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 12 }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}

            {detail.timeline?.filter((t) => t.date).length > 0 && (
              <Box sx={{ ...card, animation: `${rise} .5s ease-out .2s both` }}>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>The journey</Typography>
                {detail.timeline
                  .filter((t) => t.date)
                  .map((t, i, arr) => (
                    <Box key={t.label} sx={{ display: "flex", gap: 1.5 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ea580c", mt: "4px" }} />
                        {i < arr.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: "divider", minHeight: 22 }} />}
                      </Box>
                      <Box sx={{ pb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {t.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.date}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>
            )}

            {(detail.sections || [])
              .filter((s) => s.rows.some((r) => r.value != null && r.value !== ""))
              .map((s, idx) => (
                <Box key={s.title} sx={{ ...card, animation: `${rise} .5s ease-out ${0.25 + idx * 0.05}s both` }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{s.title}</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {s.rows
                      .filter((r) => r.value != null && r.value !== "")
                      .map((r) => (
                        <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {r.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: r.strong ? 700 : 400, textAlign: "right", wordBreak: "break-word" }}>
                            {r.value}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                </Box>
              ))}

            {detail.items?.length > 0 && (
              <Box sx={card}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>
                <Divider sx={{ mb: 1 }} />
                {detail.items.map((it, i) => (
                  <Box key={`${it.name}-${i}`} sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
                    <Typography variant="body2">
                      {it.name}
                      {it.qty != null ? ` × ${it.qty}` : ""}
                    </Typography>
                    {it.amount != null && (
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {it.amount}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {detail.note && (
              <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, pb: 1 }}>
                🔒 {detail.note}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
