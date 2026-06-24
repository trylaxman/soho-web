import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingStatusActions from "@/components/admin/bookings/BookingStatusActions";

type BookingPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  paymentIntentId: string | null;
  checkoutSessionId: string | null;
  transactionId: string | null;
  paidAt: Date | null;
  createdAt: Date;
};

export default async function BookingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            userProfile: true,
            payments: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!booking) {
        notFound();
    }

    return (
        <section>
            <div className="mb-10">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.34em] text-[#b7924c]">
                    Booking Details
                </p>

                <h1 className="font-serif text-5xl text-white">
                    {booking.userProfile.fullName}
                </h1>

                <p className="mt-4 text-[#cfc7b7]">
                    Full booking information and customer request details.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
                <div className="grid gap-6">
                    <Panel title="Customer Details">
                        <InfoGrid
                            items={[
                                ["Name", booking.userProfile.fullName],
                                ["Email", booking.userProfile.email],
                                ["Phone", booking.userProfile.phone],
                                [
                                    "Address",
                                    `${booking.userProfile.address || ""} ${booking.userProfile.apartment || ""
                                    }`,
                                ],
                                [
                                    "City / State / Zip",
                                    `${booking.userProfile.city || ""}, ${booking.userProfile.state || ""
                                    } ${booking.userProfile.zipCode || ""}`,
                                ],
                            ]}
                        />
                    </Panel>

                    <Panel title="Cleaning Details">
                        <InfoGrid
                            items={[
                                ["Service", formatLabel(booking.cleaningType)],
                                ["Home Size", booking.homeSize],
                                ["Bedrooms", String(booking.bedrooms ?? 0)],
                                ["Bathrooms", String(booking.bathrooms ?? 0)],
                                ["Kitchen", String(booking.kitchens ?? 0)],
                                ["Pets", booking.hasPets ? "Yes" : "No"],
                                ["Frequency", formatLabel(booking.frequency)],
                            ]}
                        />
                    </Panel>

                    <Panel title="Special Notes">
                        <p className="text-sm leading-7 text-[#f3eadb]">
                            {booking.specialNotes || "No special notes added."}
                        </p>
                    </Panel>
                </div>

                <div className="grid gap-6">
                    <Panel title="Schedule">
                        <InfoGrid
                            items={[
                                [
                                    "Preferred Date",
                                    booking.preferredDate
                                        ? booking.preferredDate.toDateString()
                                        : "Not selected",
                                ],
                                ["Preferred Time", booking.preferredTime || "Not selected"],
                                ["Created", booking.createdAt.toLocaleString("en-US")],
                            ]}
                        />
                    </Panel>

                    <Panel title="Status">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <StatusBadge status={booking.status} />

                            <p className="text-sm text-[#8f8778]">
                                Manage booking workflow status.
                            </p>
                        </div>

                        <div className="mt-6">
                            <BookingStatusActions
                                bookingId={booking.id}
                                currentStatus={booking.status}
                            />
                        </div>
                    </Panel>
                    <Panel title="Payments">
                        {booking.payments.length === 0 ? (
                            <p className="text-sm text-[#8f8778]">No payments recorded yet.</p>
                        ) : (
                            <div className="grid gap-4">
                                {booking.payments.map((payment: BookingPayment) => (
                                    <div
                                        key={payment.id}
                                        className="rounded-[22px] border border-[#2f291d] bg-[#111111] p-5"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {payment.currency} {payment.amount}
                                                </p>
                                                <p className="mt-1 text-xs text-[#8f8778]">
                                                    {payment.provider} · {payment.createdAt.toLocaleString("en-US")}
                                                </p>
                                            </div>

                                            <StatusBadge status={payment.status} />
                                        </div>

                                        <div className="mt-4 grid gap-3 text-xs text-[#8f8778]">
                                            <p>Payment Intent: {payment.paymentIntentId || "Not available"}</p>
                                            <p>Checkout Session: {payment.checkoutSessionId || "Not available"}</p>
                                            <p>Transaction ID: {payment.transactionId || "Not available"}</p>
                                            <p>
                                                Paid At:{" "}
                                                {payment.paidAt ? payment.paidAt.toLocaleString("en-US") : "Not paid yet"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Panel>
                </div>
            </div>
        </section>
    );
}

function Panel({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-[28px] border border-[#2a2419] bg-[#0a0a0a] p-6">
            <h2 className="mb-6 font-serif text-3xl text-white">{title}</h2>
            {children}
        </div>
    );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {items.map(([label, value]) => (
                <div
                    key={label}
                    className="rounded-[22px] border border-[#2f291d] bg-[#111111] p-5"
                >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f8778]">
                        {label}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#f3eadb]">
                        {value || "Not provided"}
                    </p>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className="inline-flex rounded-full border border-[#8f6b2f] bg-[#151008] px-4 py-2 text-sm font-medium text-[#d6ab5f]">
            {formatLabel(status)}
        </span>
    );
}

function formatLabel(value: string) {
    return value
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}