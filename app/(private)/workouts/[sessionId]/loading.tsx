const pulse = 'animate-pulse';
const dimBg = { background: 'rgba(255,255,255,0.05)' };
const faintBg = { background: 'rgba(255,255,255,0.04)' };

export default function Loading() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-4 w-12 rounded-[6px] ${pulse}`} style={dimBg} />
          <div className={`h-5 w-32 rounded-[6px] ${pulse}`} style={dimBg} />
        </div>
        <div className={`h-8 w-16 rounded-[8px] ${pulse}`} style={dimBg} />
      </div>

      <div className={`h-4 w-40 rounded-[6px] ${pulse}`} style={dimBg} />

      <div className="flex flex-col gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className={`h-[140px] rounded-[12px] ${pulse}`} style={faintBg} />
        ))}
      </div>

      <div className={`h-10 rounded-[10px] ${pulse}`} style={faintBg} />
      <div className={`h-11 rounded-[10px] ${pulse}`} style={dimBg} />
    </div>
  );
}
