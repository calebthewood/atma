import { ReactElement } from "react";

export function GlassCard({ children }: { children: ReactElement }) {
  return (
    <div className="relative h-[540px] w-[340px] shadow">
      <div className="absolute inset-0 rounded bg-gradient-to-br from-[#004476] via-[#004476] to-[#006fbe] opacity-10"></div>

      <div className="absolute inset-0 overflow-hidden rounded">
        <div className="absolute inset-0 bg-[url('/img/white-noise-2.webp')] opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/img/white-noise-1.webp')] opacity-20"></div>

        <div className="absolute inset-0 rounded bg-gradient-to-br from-white/75 to-white/30 opacity-20 backdrop-blur"></div>

        <div className="relative z-10 p-6 text-white">{children}</div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded border border-white/75 backdrop-blur"></div>
    </div>
  );
}
