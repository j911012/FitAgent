const pulse = 'animate-pulse';
const dimBg = { background: 'rgba(255,255,255,0.05)' };
const faintBg = { background: 'rgba(255,255,255,0.04)' };

export default function Loading() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-4 overflow-y-auto h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className={`h-5 w-28 rounded-[6px] ${pulse}`} style={dimBg} />
        <div className={`h-8 w-32 rounded-[8px] ${pulse}`} style={dimBg} />
      </div>

      {/* フィルタ */}
      <div className="flex gap-2">
        <div className={`h-9 flex-1 rounded-[8px] ${pulse}`} style={dimBg} />
        <div className={`h-9 w-28 rounded-[8px] shrink-0 ${pulse}`} style={dimBg} />
      </div>

      {/* セッションカード一覧 */}
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-[72px] rounded-[12px] ${pulse}`} style={faintBg} />
        ))}
      </div>
    </div>
  );
}
