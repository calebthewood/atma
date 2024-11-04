import { AspectRatio } from "./ui/aspect-ratio";

/** One of several prototypes for achieving a fogged glass look. If unused, remove from codebase */
export function WhiteNoiseCard() {
  return (
    <AspectRatio ratio={3 / 4} className="w-[340px]">
      <div className="relative h-[540px] w-[340px]">
        <div className="absolute inset-0 rounded bg-gradient-to-br from-[#004476] via-[#004476] to-[#006fbe] opacity-10"></div>

        {/* <div className="absolute rounded inset-0 bg-[url('/img/iStock-1291807006.jpg')] bg-cover bg-center opacity-70 mix-blend-overlay"></div> */}

        <div className="absolute inset-0 overflow-hidden rounded">
          <div className="absolute inset-0 bg-[url('/img/white-noise-2.webp')] opacity-20"></div>
          <div className="absolute inset-0 bg-[url('/img/white-noise-1.webp')] opacity-20"></div>

          <div className="absolute inset-0 rounded bg-gradient-to-br from-white/75 to-white/30 opacity-20 backdrop-blur-sm"></div>

          <div className="relative z-10 p-6 text-white">{/* children */}</div>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded border border-white/75 backdrop-blur"></div>
      </div>
    </AspectRatio>
  );
}
