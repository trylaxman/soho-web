import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[#060606] px-4 py-10 text-white">
      <section className="mx-auto flex min-h-[85vh] max-w-3xl items-center justify-center">
        <div className="rounded-[32px] border border-[#2a2419] bg-[#0a0a0a] p-10 text-center shadow-[0_24px_80px_rgba(214,171,95,0.12)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d6ab5f] bg-[#151008] text-4xl text-[#d6ab5f]">
            ✓
          </div>

          <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-[#b7924c]">
            Payment Successful
          </p>

          <h1 className="font-serif text-4xl text-white sm:text-5xl">
            Your Cleaning Is Booked
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#cfc7b7]">
            Thank you for choosing SoHo Cleaning Group. Your payment was
            successful and your booking is being prepared. A professional will
            be assigned soon.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="rounded-2xl bg-[#d6ab5f] px-6 py-4 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Back to Home
            </Link>

            <Link
              href="/onboarding/user"
              className="rounded-2xl border border-[#8f6b2f] px-6 py-4 text-sm font-medium text-[#e3bd74] transition hover:bg-[#151008]"
            >
              Book Another Cleaning
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}