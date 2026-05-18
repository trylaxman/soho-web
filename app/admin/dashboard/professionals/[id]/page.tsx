import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfessionalStatusActions from "@/components/admin/professionals/ProfessionalStatusActions";

export default async function ProfessionalDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const professional = await prisma.professionalProfile.findUnique({
        where: { id },
    });

    if (!professional) {
        notFound();
    }

    return (
        <section>
            <div className="mb-10">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.34em] text-[#b7924c]">
                    Professional Details
                </p>

                <h1 className="font-serif text-5xl text-white">
                    {professional.fullName}
                </h1>

                <p className="mt-4 text-[#cfc7b7]">
                    Review professional application details.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.7fr_1fr]">
                <div className="rounded-[28px] border border-[#2a2419] bg-[#0a0a0a] p-6 text-center">
                    <div className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[#8f6b2f] bg-[#151008] font-serif text-4xl text-[#d6ab5f]">
                        {professional.profileImageUrl ? (
                            <Image
                                src={professional.profileImageUrl}
                                alt={professional.fullName}
                                fill
                                sizes="128px"
                                className="object-cover"
                            />
                        ) : (
                            getInitials(professional.fullName)
                        )}
                    </div>

                    <h2 className="mt-6 font-serif text-3xl text-white">
                        {professional.fullName}
                    </h2>

                    <p className="mt-2 text-sm text-[#cfc7b7]">{professional.email}</p>
                    <p className="mt-1 text-sm text-[#cfc7b7]">{professional.phone}</p>

                    <div className="mt-5">
                        <StatusBadge status={professional.status} />
                    </div>
                </div>

                <div className="grid gap-6">
                    <Panel title="Profile Information">
                        <InfoGrid
                            items={[
                                ["Experience", `${professional.experienceYears ?? 0} years`],
                                ["Own Supplies", professional.hasOwnSupplies ? "Yes" : "No"],
                                ["Transport", professional.hasTransport ? "Yes" : "No"],
                                [
                                    "Applied On",
                                    professional.createdAt.toLocaleDateString("en-US"),
                                ],
                            ]}
                        />
                    </Panel>

                    <Panel title="Services & Availability">
                        <InfoGrid
                            items={[
                                [
                                    "Services Offered",
                                    professional.servicesOffered.length
                                        ? professional.servicesOffered.map(formatLabel).join(", ")
                                        : "Not selected",
                                ],
                                [
                                    "Service Areas",
                                    professional.serviceAreas.length
                                        ? professional.serviceAreas.join(", ")
                                        : "Not provided",
                                ],
                                [
                                    "Availability",
                                    professional.availability.length
                                        ? professional.availability.map(formatLabel).join(", ")
                                        : "Not selected",
                                ],
                            ]}
                        />
                    </Panel>

                    <Panel title="Bio / Work Background">
                        <p className="text-sm leading-7 text-[#f3eadb]">
                            {professional.bio || "No bio provided."}
                        </p>
                    </Panel>

                    <Panel title="Admin Actions">
                        <ProfessionalStatusActions
                            professionalId={professional.id}
                            currentStatus={professional.status}
                        />
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

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function formatLabel(value: string) {
    return value
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}