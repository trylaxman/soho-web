import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[#060606] px-4 py-16 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-[#b7924c]">
          Terms & Conditions
        </p>

        <h1 className="font-serif text-4xl text-white sm:text-6xl">
          Terms and Conditions
        </h1>

        <div className="mt-10 space-y-8 rounded-[32px] border border-[#2a2419] bg-[#0a0a0a] p-6 text-sm leading-8 text-[#d6d0c5] sm:p-10">
          <Section title="1. Services">
            SoHo Cleaning Group provides residential cleaning services in
            Manhattan. Service scope may vary based on the cleaning type,
            property condition, selected add-ons, and booking details.
          </Section>

          <Section title="2. Bookings">
            Customers are responsible for providing accurate booking details,
            including address, home size, access instructions, preferred date,
            time slot, and any special notes.
          </Section>

          <Section title="3. Payments">
            Payments are processed securely through Stripe. A booking is only
            submitted after successful payment. Pricing may vary based on
            service type, home size, square footage, and requested services.
          </Section>

          <Section title="4. Access to Property">
            Customers must ensure safe and timely access to the property. If our
            team cannot access the property at the scheduled time, the booking
            may be delayed, rescheduled, or subject to cancellation.
          </Section>

          <Section title="5. Service Limitations">
            We provide residential cleaning services only. We do not perform
            remediation, restoration, biohazard cleanup, pest-related cleanup,
            exterior window cleaning, heavy lifting, unsafe ladder work,
            appliance repair, plumbing, electrical work, or hazardous-material
            handling.
          </Section>

          <Section title="6. Pets">
            Customers must disclose whether pets are present in the home. Pets
            should be safely secured during the cleaning visit for the safety of
            both the cleaning professional and the pet.
          </Section>

          <Section title="7. Cancellations and Rescheduling">
            Cancellation and rescheduling requests should be made as early as
            possible. SoHo Cleaning Group reserves the right to apply
            cancellation or rescheduling fees where appropriate.
          </Section>

          <Section title="8. Liability">
            SoHo Cleaning Group takes reasonable care while performing services.
            Customers must report any concerns promptly. We are not responsible
            for pre-existing damage, fragile items not disclosed in advance, or
            unsafe working conditions.
          </Section>

          <Section title="9. Professional Conduct">
            Our cleaning professionals are expected to follow company standards,
            respect customer privacy, and perform services with care,
            discretion, and professionalism.
          </Section>

          <Section title="10. Changes to Terms">
            SoHo Cleaning Group may update these Terms and Conditions from time
            to time. Continued use of our services means you accept the updated
            terms.
          </Section>

          <div className="border-t border-[#2a2419] pt-8">
            <p className="text-xs text-[#8f8778]">
              Last updated: 2026
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-2xl bg-[#d6ab5f] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-serif text-2xl text-white">{title}</h2>
      <p>{children}</p>
    </section>
  );
}