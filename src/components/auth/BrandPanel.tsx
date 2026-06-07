const WAVE_BARS = [
  56, 88, 132, 104, 152, 72, 136, 112, 168, 96, 144, 64, 124, 156, 80,
  116, 160, 100, 136, 72, 148, 92, 128, 60, 112, 152, 84, 140, 68, 120,
];

export default function BrandPanel() {
  return (
    <aside className="relative hidden min-h-[calc(100vh-48px)] overflow-hidden rounded-[28px] bg-blue-600 lg:flex lg:flex-col lg:justify-between">
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 size-72 rounded-full border border-white/15"
      />
      <div
        aria-hidden="true"
        className="absolute -right-5 top-16 size-44 rounded-full border border-white/10"
      />

      <div className="relative p-10 xl:p-12">
        <h2 className="font-display max-w-lg text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-white xl:text-6xl">
          Every learner deserves a teacher that carries them along.
        </h2>
        <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
          Type what you want to learn. Grasp builds a full course, teaches it
          to you out loud, and answers your questions along the way.
        </p>
      </div>

      <div
        aria-hidden="true"
        className="relative flex h-44 w-full items-end justify-between gap-1"
      >
        {WAVE_BARS.map((height, index) => (
          <span
            className="flex-1 rounded-t-full bg-white/75"
            key={`${height}-${index}`}
            style={{ height }}
          />
        ))}
      </div>
    </aside>
  );
}
