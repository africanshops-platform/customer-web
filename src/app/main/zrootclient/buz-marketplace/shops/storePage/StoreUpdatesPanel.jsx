/**
 * The right-hand side of the store page. Statuses and posts from the merchant land here once the business feed ships;
 * until then it says so honestly, and the layout is already in place so the feed drops straight in.
 */
function StoreUpdatesPanel() {
  return (
    <div
      className="flex flex-col h-full p-6 gap-4"
      style={{ background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)" }}
    >
      <div
        className="p-4 rounded-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
          boxShadow: "0 4px 15px rgba(234, 88, 12, 0.3)",
        }}
      >
        <span className="text-white text-xl font-bold">Updates</span>
      </div>

      <div
        className="bg-white rounded-2xl shadow-lg p-6 text-center"
        data-testid="store-updates-soon"
      >
        <svg viewBox="0 0 150 110" width="150" fill="none" aria-hidden="true" className="mx-auto">
          <rect x="30" y="14" width="90" height="84" rx="12" fill="#fff1e6" />
          <circle cx="52" cy="38" r="9" fill="#ea580c" />
          <rect x="68" y="32" width="38" height="6" rx="3" fill="#e9e4de" />
          <rect x="68" y="44" width="26" height="6" rx="3" fill="#e9e4de" />
          <rect x="42" y="62" width="66" height="26" rx="8" fill="#ea580c" opacity=".85" />
          <path
            d="M62 78l8-8 8 8 6-6 8 8"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-lg font-bold text-gray-900 mt-3 mb-1">Shop updates are on the way</h2>
        <p className="text-sm text-gray-500 m-0">
          Statuses, tips and events from this shop will show up here. Check back soon.
        </p>
      </div>
    </div>
  );
}

export default StoreUpdatesPanel;
