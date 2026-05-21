import Image from "next/image";
import { GalleryVerticalEnd } from "lucide-react";

import { SignupForm } from "~/components/signup-form";

export default function SignupPage() {
  return (
    <main className="dark min-h-svh overflow-hidden bg-[#08090d] text-foreground">
      <div className="grid min-h-svh lg:grid-cols-[minmax(430px,0.82fr)_minmax(0,1.18fr)]">
        <section className="relative flex min-h-svh flex-col px-6 py-7 sm:px-10 lg:px-16">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),transparent_30%),linear-gradient(180deg,#101016_0%,#08090d_46%,#07080c_100%)]" />
          <header className="relative flex items-center justify-between gap-4">
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-zinc-100">
              <div className="flex size-8 items-center justify-center rounded-md bg-violet-500 text-white shadow-lg shadow-violet-950/50">
                <GalleryVerticalEnd className="size-4" />
              </div>
              FormOra
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-100 hover:underline"
            >
              Sign in
            </a>
          </header>
          <div className="relative flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-[460px]">
              <SignupForm />
            </div>
          </div>
          <p className="relative text-center text-xs leading-5 text-zinc-500 sm:text-left">
            Free to start. No credit card required.
          </p>
        </section>

        <aside className="relative min-h-[380px] overflow-hidden border-t border-white/10 bg-[#090817] lg:min-h-svh lg:border-l lg:border-t-0">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#100d24_0%,#090817_48%,#07080d_100%)]" />
          <Image
            src="/formora-preview.png"
            alt="Form builder interface preview"
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-contain object-center p-5 sm:p-8 lg:p-10 xl:p-12"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,13,0)_70%,rgba(8,9,13,0.62)_100%)] lg:bg-[linear-gradient(90deg,rgba(8,9,13,0.72)_0%,rgba(8,9,13,0.18)_19%,rgba(8,9,13,0)_42%)]" />
        </aside>
      </div>
    </main>
  );
}
