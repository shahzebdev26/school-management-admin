'use client'

function HeaderArt() {
  return (
    <>
      {/* Decorative concentric rings */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 size-72 rounded-full border border-primary-foreground/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-4 -right-4 size-56 rounded-full border border-primary-foreground/15 bg-primary-foreground/[0.02]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-4 right-4 size-40 rounded-full border border-primary-foreground/20 bg-primary-foreground/[0.03]"
        aria-hidden="true"
      />

      {/* Signature tilted squircle, in the warm accent hue */}
      <div
        className="pointer-events-none absolute top-14 right-6 size-24 rotate-12 rounded-xl bg-warm shadow-md sm:right-8 sm:size-28"
        aria-hidden="true"
      />

      {/* Floating crisp white accent dot */}
      <div
        className="pointer-events-none absolute top-11 right-36 size-3.5 rounded-full bg-primary-foreground shadow-xs sm:right-44"
        aria-hidden="true"
      />
    </>
  )
}

function BrandBar() {
  return (
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-card font-black text-lg text-primary-strong shadow-xs sm:size-10 sm:text-xl">
          TS
        </span>
        <span className="font-extrabold text-base tracking-tight text-primary-foreground sm:text-lg">
          TechSparks Admin
        </span>
      </div>
    </div>
  )
}

export function LoginHeader() {
  return (
    <div className="relative overflow-hidden bg-primary-strong px-6 pt-7 pb-14 text-primary-foreground sm:px-8 sm:pt-8 sm:pb-16">
      <HeaderArt />
      <BrandBar />

      <div className="relative z-10 mt-7 sm:mt-9">
        <h1 className="font-extrabold text-2xl leading-none text-primary-foreground sm:text-3xl">
          Welcome to
        </h1>
        <p className="mt-1 font-black text-3xl tracking-tight text-primary-foreground sm:text-4xl">
          TechSparks Admin
        </p>
        <p className="mt-2.5 max-w-[32ch] font-medium text-primary-foreground/85 text-xs sm:text-sm">
          Platform administration & operations, in one app.
        </p>
      </div>
    </div>
  )
}
