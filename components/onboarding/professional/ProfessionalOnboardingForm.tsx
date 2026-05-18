"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

type FormData = {
    fullName: string;
    email: string;
    phone: string;
    profileImageUrl: string;
    experienceYears: string;
    servicesOffered: string[];
    serviceAreas: string;
    availability: string[];
    hasOwnSupplies: boolean;
    hasTransport: boolean;
    bio: string;
};

const initialData: FormData = {
    fullName: "",
    email: "",
    phone: "",
    profileImageUrl: "",
    experienceYears: "",
    servicesOffered: [],
    serviceAreas: "",
    availability: [],
    hasOwnSupplies: false,
    hasTransport: false,
    bio: "",
};

const steps = ["Personal", "Services", "Availability", "Review"];

const serviceOptions = [
    "STANDARD",
    "DEEP",
    "MOVE_IN_MOVE_OUT",
    "RECURRING",
    "AIRBNB_TURNOVER",
];

const availabilityOptions = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

export default function ProfessionalOnboardingForm() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<FormData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleArrayValue = (
        field: "servicesOffered" | "availability",
        value: string
    ) => {
        setFormData((prev) => {
            const current = prev[field];

            return {
                ...prev,
                [field]: current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value],
            };
        });
    };

    const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

    const submitForm = async () => {
        try {
            setIsSubmitting(true);

            const response = await fetch("/api/onboarding/professional", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    serviceAreas: formData.serviceAreas
                        .split(",")
                        .map((area) => area.trim())
                        .filter(Boolean),
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Something went wrong");
            }

            setIsSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const uploadProfileImage = async (file: File) => {
        try {
            setIsUploadingProfileImage(true);

            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}.${fileExt}`;
            const filePath = `profiles/${fileName}`;

            const { error } = await supabase.storage
                .from("professional-profiles")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) {
                console.error(error);
                alert("Image upload failed. Please try again.");
                return;
            }

            const { data } = supabase.storage
                .from("professional-profiles")
                .getPublicUrl(filePath);

            updateField("profileImageUrl", data.publicUrl);
        } catch (error) {
            console.error(error);
            alert("Image upload failed. Please try again.");
        } finally {
            setIsUploadingProfileImage(false);
        }
    };

    if (isSuccess) {
        return (
            <main className="min-h-screen bg-[#060606] px-4 py-10 text-white">
                <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
                    <div className="relative rounded-[32px] border border-[#2a2419] bg-[#0a0a0a] p-10 text-center shadow-[0_24px_80px_rgba(214,171,95,0.12)]">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(initialData);
                                setStep(0);
                                setIsSuccess(false);
                            }}
                            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#8f6b2f] text-[#d6ab5f] transition hover:bg-[#151008]"
                        >
                            ✕
                        </button>

                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d6ab5f] bg-[#151008] text-4xl text-[#d6ab5f]">
                            ✓
                        </div>

                        <h1 className="font-serif text-4xl text-white">
                            Application Received
                        </h1>

                        <p className="mt-4 text-[#cfc7b7]">
                            Thank you for applying to join SoHo Cleaning Group. Our team will
                            review your profile and contact you shortly.
                        </p>

                        <Link
                            href="/"
                            className="mt-8 inline-flex rounded-2xl bg-[#d6ab5f] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#060606] px-4 py-10 text-white">
            <section className="mx-auto max-w-4xl">
                <div className="mb-10 text-center">
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-[#b7924c]">
                        Professional Onboarding
                    </p>

                    <h1 className="font-serif text-4xl text-white sm:text-5xl">
                        Join SoHo Cleaning Group
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-[#d6d0c5]">
                        Tell us about your experience, service areas, and availability.
                    </p>
                </div>

                <div className="mb-8 grid grid-cols-4 gap-3">
                    {steps.map((item, index) => (
                        <div key={item}>
                            <div
                                className={`h-2 rounded-full ${index <= step ? "bg-[#d6ab5f]" : "bg-[#2a2419]"
                                    }`}
                            />
                            <p
                                className={`mt-2 text-center text-xs ${index <= step ? "text-[#d6ab5f]" : "text-[#7e7464]"
                                    }`}
                            >
                                {item}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="rounded-[32px] border border-[#2a2419] bg-[#0a0a0a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-10">
                    {step === 0 && (
                        <div className="grid gap-5">
                            <ProfileImageUpload
                                value={formData.profileImageUrl}
                                isUploading={isUploadingProfileImage}
                                onChange={uploadProfileImage}
                            />
                            <Input
                                label="Full Name"
                                value={formData.fullName}
                                onChange={(value) => updateField("fullName", value)}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(value) => updateField("email", value)}
                            />

                            <Input
                                label="Phone Number"
                                value={formData.phone}
                                onChange={(value) => updateField("phone", value)}
                            />

                            <Input
                                label="Years of Experience"
                                type="number"
                                value={formData.experienceYears}
                                onChange={(value) => updateField("experienceYears", value)}
                            />
                        </div>
                    )}

                    {step === 1 && (
                        <div className="grid gap-6">
                            <div>
                                <p className="mb-3 text-sm font-medium text-[#d8d0c1]">
                                    Which services can you provide?
                                </p>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {serviceOptions.map((service) => (
                                        <CheckboxCard
                                            key={service}
                                            label={formatLabel(service)}
                                            checked={formData.servicesOffered.includes(service)}
                                            onClick={() => toggleArrayValue("servicesOffered", service)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Textarea
                                label="Service Areas / Zip Codes"
                                placeholder="Example: SoHo, Tribeca, Chelsea, 10012, 10013"
                                value={formData.serviceAreas}
                                onChange={(value) => updateField("serviceAreas", value)}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <SwitchCard
                                    label="I have my own cleaning supplies"
                                    checked={formData.hasOwnSupplies}
                                    onClick={() =>
                                        updateField("hasOwnSupplies", !formData.hasOwnSupplies)
                                    }
                                />

                                <SwitchCard
                                    label="I have reliable transportation"
                                    checked={formData.hasTransport}
                                    onClick={() => updateField("hasTransport", !formData.hasTransport)}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid gap-6">
                            <div>
                                <p className="mb-3 text-sm font-medium text-[#d8d0c1]">
                                    Select your available days
                                </p>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {availabilityOptions.map((day) => (
                                        <CheckboxCard
                                            key={day}
                                            label={formatLabel(day)}
                                            checked={formData.availability.includes(day)}
                                            onClick={() => toggleArrayValue("availability", day)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Textarea
                                label="Short Bio / Work Background"
                                placeholder="Tell us briefly about your cleaning experience, work style, and customer service approach."
                                value={formData.bio}
                                onChange={(value) => updateField("bio", value)}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid gap-6">
                            <div className="rounded-[28px] border border-[#2f291d] bg-[#111111] p-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#8f6b2f] bg-[#151008] font-serif text-3xl text-[#d6ab5f]">
                                        {formData.profileImageUrl ? (
                                            <Image
                                                src={formData.profileImageUrl}
                                                alt={formData.fullName}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        ) : formData.fullName ? (
                                            formData.fullName
                                                .split(" ")
                                                .map((name) => name[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()
                                        ) : (
                                            "SC"
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="font-serif text-3xl text-white">
                                            {formData.fullName || "Cleaning Professional"}
                                        </h2>
                                        <p className="mt-1 text-sm text-[#cfc7b7]">{formData.email}</p>
                                        <p className="mt-1 text-sm text-[#cfc7b7]">{formData.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <CompactReviewItem
                                    label="Experience"
                                    value={`${formData.experienceYears || "0"} years`}
                                />
                                <CompactReviewItem
                                    label="Service Areas"
                                    value={formData.serviceAreas || "Not provided"}
                                />
                                <CompactReviewItem
                                    label="Services"
                                    value={
                                        formData.servicesOffered.length
                                            ? formData.servicesOffered.map(formatLabel).join(", ")
                                            : "Not selected"
                                    }
                                />
                                <CompactReviewItem
                                    label="Availability"
                                    value={
                                        formData.availability.length
                                            ? formData.availability.map(formatLabel).join(", ")
                                            : "Not selected"
                                    }
                                />
                                <CompactReviewItem
                                    label="Own Supplies"
                                    value={formData.hasOwnSupplies ? "Yes" : "No"}
                                />
                                <CompactReviewItem
                                    label="Transportation"
                                    value={formData.hasTransport ? "Yes" : "No"}
                                />
                            </div>

                            <div className="rounded-[24px] border border-[#2f291d] bg-[#111111] p-5">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#8f8778]">
                                    Bio / Work Background
                                </p>
                                <p className="mt-3 text-sm leading-7 text-[#f3eadb]">
                                    {formData.bio || "Not provided"}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="rounded-2xl border border-[#5b5141] px-6 py-3 text-sm font-medium text-[#b8ad9a] transition hover:border-[#8f6b2f] hover:text-[#e3bd74]"
                            >
                                Cancel
                            </Link>

                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 0}
                                className="rounded-2xl border border-[#8f6b2f] px-6 py-3 text-sm font-medium text-[#e3bd74] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Back
                            </button>
                        </div>

                        {step < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="rounded-2xl bg-[#d6ab5f] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={submitForm}
                                disabled={isSubmitting}
                                className="rounded-2xl bg-[#d6ab5f] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#d8d0c1]">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={inputClass}
            />
        </label>
    );
}

function Textarea({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#d8d0c1]">
                {label}
            </span>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={5}
                placeholder={placeholder}
                className={`${inputClass} resize-none`}
            />
        </label>
    );
}

function CheckboxCard({
    label,
    checked,
    onClick,
}: {
    label: string;
    checked: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border px-5 py-4 text-left text-sm transition ${checked
                ? "border-[#d6ab5f] bg-[#151008] text-[#d6ab5f]"
                : "border-[#2f291d] bg-[#111111] text-[#d8d0c1] hover:border-[#8f6b2f]"
                }`}
        >
            <span className="mr-2">{checked ? "✓" : "○"}</span>
            {label}
        </button>
    );
}

function SwitchCard({
    label,
    checked,
    onClick,
}: {
    label: string;
    checked: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm transition ${checked
                ? "border-[#d6ab5f] bg-[#151008] text-[#d6ab5f]"
                : "border-[#2f291d] bg-[#111111] text-[#d8d0c1] hover:border-[#8f6b2f]"
                }`}
        >
            <span>{label}</span>
            <span>{checked ? "Yes" : "No"}</span>
        </button>
    );
}

function CompactReviewItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[22px] border border-[#2f291d] bg-[#111111] p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f8778]">
                {label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#f3eadb]">{value}</p>
        </div>
    );
}

function formatLabel(value: string) {
    return value
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function ProfileImageUpload({
    value,
    isUploading,
    onChange,
}: {
    value: string;
    isUploading: boolean;
    onChange: (file: File) => void;
}) {
    return (
        <div className="flex flex-col items-center rounded-[28px] border border-[#2f291d] bg-[#111111] p-6 text-center">
            <div className="relative mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[#8f6b2f] bg-[#151008] text-3xl text-[#d6ab5f]">
                {value ? (
                    <Image
                        src={value}
                        alt="Professional profile"
                        fill
                        sizes="112px"
                        className={`object-cover ${isUploading ? "opacity-40" : ""}`}
                    />
                ) : (
                    <span className={isUploading ? "opacity-20" : ""}>SC</span>
                )}

                {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d6ab5f] border-t-transparent" />
                        <span className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#d6ab5f]">
                            Uploading
                        </span>
                    </div>
                )}
            </div>

            <label
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${isUploading
                    ? "cursor-not-allowed bg-[#2a2419] text-[#7e7464]"
                    : "cursor-pointer bg-[#d6ab5f] text-black hover:scale-[1.02]"
                    }`}
            >
                {isUploading ? "Uploading..." : value ? "Change Profile Picture" : "Upload Profile Picture"}

                <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    className="hidden"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onChange(file);
                        event.target.value = "";
                    }}
                />
            </label>

            <p className="mt-3 text-xs text-[#8f8778]">
                Upload a clear photo. JPG or PNG recommended.
            </p>
        </div>
    );
}

const inputClass =
    "w-full rounded-2xl border border-[#2f291d] bg-[#111111] px-4 py-4 text-sm text-white placeholder:text-[#8f8778] outline-none transition focus:border-[#d6ab5f]";