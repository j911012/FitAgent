import { Suspense } from 'react';
import { fetchBodyRecords } from '@/apis/bodyRecords.server';
import { fetchLatestGoal } from '@/apis/goals.server';
import Dashboard from '@/components/Dashboard';

// page.tsx は同期 Server Component にする（rules: 02_components）
// Promiseをawaitせず子コンポーネントに渡してストリーミングする
export default function Page() {
  const bodyRecordsPromise = fetchBodyRecords();
  const goalPromise = fetchLatestGoal();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard
        bodyRecordsPromise={bodyRecordsPromise}
        goalPromise={goalPromise}
      />
    </Suspense>
  );
}

// 実際のレイアウト構造・寸法に合わせたスケルトン
// Dashboard と同じ構造（ヘッダー + 左ペイン + 右ペイン）で違和感をなくす
function PageSkeleton() {
  const pulse = 'animate-pulse';
  const block = `${pulse} rounded-[10px]`;
  const dimBg = { background: 'rgba(255,255,255,0.05)' };
  const faintBg = { background: 'rgba(255,255,255,0.03)' };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダーバー */}
      <div
        className="flex items-center justify-between px-5 h-[46px] flex-shrink-0"
        style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <div className={`w-[26px] h-[26px] rounded-[7px] ${pulse}`} style={dimBg} />
          <div className={`w-14 h-3 rounded ${pulse}`} style={dimBg} />
        </div>
        <div className={`w-32 h-2.5 rounded ${pulse} hidden sm:block`} style={dimBg} />
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        {/* PC 左ペイン */}
        <aside
          className="hidden md:flex md:w-[280px] flex-shrink-0 flex-col gap-3 p-[18px_16px]"
          style={{ borderRight: '0.5px solid rgba(255,255,255,0.05)' }}
        >
          {/* 日付カード */}
          <div className={`${block} h-[82px]`} style={faintBg} />
          {/* 体重・体脂肪率 2カラム */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`${block} h-[90px]`} style={dimBg} />
            <div className={`${block} h-[90px]`} style={dimBg} />
          </div>
          {/* プログレスバー */}
          <div className="space-y-3 pt-1">
            <div className={`h-3 rounded ${pulse}`} style={dimBg} />
            <div className={`h-3 rounded ${pulse}`} style={dimBg} />
          </div>
          {/* 記録ボタン */}
          <div className={`mt-auto h-[42px] rounded-[9px] ${pulse}`} style={dimBg} />
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-[14px] md:p-[18px] flex flex-col gap-3.5">
          {/* SP: 3カラム統計 */}
          <div className="md:hidden grid grid-cols-3 gap-2">
            <div className={`${block} h-[80px]`} style={faintBg} />
            <div className={`${block} h-[80px]`} style={dimBg} />
            <div className={`${block} h-[80px]`} style={dimBg} />
          </div>
          {/* SP: プログレスバー */}
          <div className="md:hidden space-y-3">
            <div className={`h-3 rounded ${pulse}`} style={dimBg} />
            <div className={`h-3 rounded ${pulse}`} style={dimBg} />
          </div>
          {/* グラフ */}
          <div>
            <div className={`w-20 h-2.5 rounded mb-2 ${pulse}`} style={dimBg} />
            <div className={`${block} h-[148px]`} style={dimBg} />
          </div>
          {/* 記録一覧 */}
          <div>
            <div className={`w-20 h-2.5 rounded mb-2 ${pulse}`} style={dimBg} />
            <div className={`${block} p-[10px_14px]`} style={dimBg}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-9 rounded mb-2 last:mb-0 ${pulse}`}
                  style={faintBg}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
