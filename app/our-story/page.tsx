import Link from "next/link";

const trustPoints = [
  "Professionally registered business",
  "Fully insured and bonded",
  "Carefully selected in-house cleaning professionals",
  "Clear standards, training, and accountability",
  "Consistent quality and professionalism on every visit",
];

export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-[#060606] px-4 py-16 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-[#b7924c]">
            Our Story
          </p>

          <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-white sm:text-6xl">
            A Clean Home Is Important. Knowing Who You’re Letting Into It Is
            Even More Important.
          </h1>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-[#2a2419] bg-[#0a0a0a] shadow-[0_24px_80px_rgba(214,171,95,0.10)]">
          <div className="border-b border-[#2a2419] bg-[radial-gradient(circle_at_top,rgba(214,171,95,0.16),transparent_40%)] p-8 sm:p-12">
            <p className="max-w-3xl text-lg leading-9 text-[#d6d0c5]">
              When you hire a cleaning company, you’re not simply purchasing a
              cleaning service. You’re placing trust in the people entering your
              home—your personal space, your valuables, your family, and your
              privacy.
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-7 p-8 sm:p-12">
              <p className="text-base leading-8 text-[#cfc7b7]">
                Unfortunately, many cleaning services in New York operate with
                little transparency. Some rely heavily on subcontractors,
                temporary workers, or third-party staffing networks, meaning the
                person arriving at your door may have little connection to the
                company whose logo is on the website.
              </p>

              <p className="font-serif text-3xl leading-tight text-white sm:text-4xl">
                At SoHo Cleaning Group, we believe trust should never be
                outsourced.
              </p>

              <p className="text-base leading-8 text-[#cfc7b7]">
                That’s why we operate with a different philosophy.
              </p>

              <div className="grid gap-3">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-[#2f291d] bg-[#111111] px-5 py-4 text-sm font-medium text-[#f3eadb]"
                  >
                    <span className="mr-3 text-[#d6ab5f]">✓</span>
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#2a2419] bg-[#0c0a07] p-8 sm:p-12 lg:border-l lg:border-t-0">
              <div className="sticky top-8 rounded-[28px] border border-[#8f6b2f]/50 bg-[#111111] p-7">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#b7924c]">
                  Our Promise
                </p>

                <p className="mt-5 font-serif text-3xl leading-tight text-white">
                  Our goal isn’t simply to leave your apartment looking
                  pristine. It’s to provide peace of mind.
                </p>

                <p className="mt-6 text-sm leading-7 text-[#cfc7b7]">
                  Because true luxury isn’t just walking into a spotless home.
                </p>

                <p className="mt-4 text-lg font-medium leading-8 text-[#e3bd74]">
                  It’s knowing exactly who was in it.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#2a2419] p-8 text-center sm:p-12">
            <p className="mx-auto max-w-3xl text-lg leading-9 text-[#d6d0c5]">
              At SoHo Cleaning Group, we treat your home with the same respect,
              discretion, and care we would expect for our own.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/onboarding/user"
                className="rounded-2xl bg-[#d6ab5f] px-6 py-4 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Book Your Cleaning
              </Link>

              <Link
                href="/"
                className="rounded-2xl border border-[#8f6b2f] px-6 py-4 text-sm font-medium text-[#e3bd74] transition hover:bg-[#151008]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}