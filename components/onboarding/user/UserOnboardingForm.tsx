"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  calculateCleaningPrice,
  type CleaningType,
  type HomeSize,
} from "@/lib/pricing/cleaning-pricing";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  cleaningType: string;
  homeSize: string;
  totalSqft: string;
  bedrooms: string;
  bathrooms: string;
  kitchens: string;
  frequency: string;
  preferredDate: Date | null;
  preferredTime: string;
  specialNotes: string;
};

const initialData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zipCode: "",
  cleaningType: "",
  homeSize: "",
  totalSqft: "",
  bedrooms: "",
  bathrooms: "",
  kitchens: "",
  frequency: "",
  preferredDate: null,
  preferredTime: "",
  specialNotes: "",
};

const steps = ["Personal", "Address", "Cleaning", "Schedule", "Review"];

const timeSlots = [
  { label: "8:00 AM - 10:00 AM", value: "08:00-10:00" },
  { label: "10:00 AM - 12:00 PM", value: "10:00-12:00" },
  { label: "12:00 PM - 2:00 PM", value: "12:00-14:00" },
  { label: "2:00 PM - 4:00 PM", value: "14:00-16:00" },
  { label: "4:00 PM - 6:00 PM", value: "16:00-18:00" },
];

export default function UserOnboardingForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pricing =
    formData.cleaningType && formData.homeSize
      ? calculateCleaningPrice({
          cleaningType: formData.cleaningType as CleaningType,
          homeSize: formData.homeSize as HomeSize,
          totalSqft: Number(formData.totalSqft),
        })
      : null;

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const submitForm = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/onboarding/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          preferredDate: formData.preferredDate
            ? formData.preferredDate.toISOString()
            : null,
          pricing,
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
              Booking Request Received
            </h1>

            <p className="mt-4 text-[#cfc7b7]">
              Thank you for choosing SoHo Cleaning Group. Your booking request
              has been received successfully.
            </p>
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
            Cleaning Booking
          </p>

          <h1 className="font-serif text-4xl text-white sm:text-5xl">
            Book Your Premium Cleaning
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[#d6d0c5]">
            Tell us about your home, choose your schedule, review pricing, and
            continue to secure checkout.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-5 gap-3">
          {steps.map((item, index) => (
            <div key={item}>
              <div
                className={`h-2 rounded-full ${
                  index <= step ? "bg-[#d6ab5f]" : "bg-[#2a2419]"
                }`}
              />
              <p
                className={`mt-2 text-center text-xs ${
                  index <= step ? "text-[#d6ab5f]" : "text-[#7e7464]"
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
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5">
              <Input
                label="Street Address"
                value={formData.address}
                onChange={(value) => updateField("address", value)}
              />

              <Input
                label="Apartment / Unit"
                value={formData.apartment}
                onChange={(value) => updateField("apartment", value)}
              />

              <div className="grid gap-5 md:grid-cols-3">
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(value) => updateField("city", value)}
                />

                <Input
                  label="State"
                  value={formData.state}
                  onChange={(value) => updateField("state", value)}
                />

                <Input
                  label="Zip Code"
                  value={formData.zipCode}
                  onChange={(value) => updateField("zipCode", value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5">
              <Select
                label="Cleaning Type"
                value={formData.cleaningType}
                onChange={(value) => updateField("cleaningType", value)}
                options={[
                  { label: "Standard Cleaning", value: "STANDARD" },
                  { label: "Deep Cleaning", value: "DEEP" },
                  { label: "Move In / Move Out", value: "MOVE_IN_MOVE_OUT" },
                  { label: "Recurring Cleaning", value: "RECURRING" },
                  { label: "Airbnb Turnover", value: "AIRBNB_TURNOVER" },
                ]}
              />

              <Select
                label="Home Size"
                value={formData.homeSize}
                onChange={(value) => updateField("homeSize", value)}
                options={[
                  { label: "1 BHK", value: "1BHK" },
                  { label: "2 BHK", value: "2BHK" },
                  { label: "3 BHK", value: "3BHK" },
                  { label: "4 BHK", value: "4BHK" },
                ]}
              />

              <Input
                label="Total Area (sqft)"
                type="number"
                value={formData.totalSqft}
                onChange={(value) => updateField("totalSqft", value)}
              />

              <div className="grid gap-5 md:grid-cols-3">
                <Input
                  label="Bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(value) => updateField("bedrooms", value)}
                />

                <Input
                  label="Bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(value) => updateField("bathrooms", value)}
                />

                <Input
                  label="Kitchen"
                  type="number"
                  value={formData.kitchens}
                  onChange={(value) => updateField("kitchens", value)}
                />
              </div>

              <Select
                label="Frequency"
                value={formData.frequency}
                onChange={(value) => updateField("frequency", value)}
                options={[
                  { label: "One Time", value: "ONE_TIME" },
                  { label: "Weekly", value: "WEEKLY" },
                  { label: "Bi-Weekly", value: "BI_WEEKLY" },
                  { label: "Monthly", value: "MONTHLY" },
                ]}
              />

              {pricing && (
                <div className="rounded-[24px] border border-[#3a2812] bg-[#0c0a07] p-5">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#8f8778]">
                        Live Estimate
                      </p>
                      <p className="mt-2 text-sm text-[#cfc7b7]">
                        Based on selected service and area.
                      </p>
                    </div>

                    <p className="font-serif text-3xl text-[#d6ab5f]">
                      ${pricing.total}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <DatePickerField
                  label="Preferred Date"
                  value={formData.preferredDate}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredDate: date,
                    }))
                  }
                />

                <Select
                  label="Preferred Time Slot"
                  value={formData.preferredTime}
                  onChange={(value) => updateField("preferredTime", value)}
                  options={timeSlots}
                />
              </div>

              <Textarea
                label="Special Notes"
                value={formData.specialNotes}
                onChange={(value) => updateField("specialNotes", value)}
              />
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6">
              <div className="rounded-[28px] border border-[#2f291d] bg-[#111111] p-6">
                <h2 className="font-serif text-3xl text-white">
                  Review Your Booking
                </h2>

                <p className="mt-2 text-sm leading-7 text-[#cfc7b7]">
                  Please review your details before continuing to secure
                  checkout.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <CompactReviewItem label="Name" value={formData.fullName} />
                <CompactReviewItem label="Email" value={formData.email} />
                <CompactReviewItem label="Phone" value={formData.phone} />
                <CompactReviewItem
                  label="Address"
                  value={`${formData.address}, ${formData.apartment || ""}`}
                />
                <CompactReviewItem
                  label="City / State / Zip"
                  value={`${formData.city}, ${formData.state} ${formData.zipCode}`}
                />
                <CompactReviewItem
                  label="Schedule"
                  value={`${
                    formData.preferredDate
                      ? formData.preferredDate.toDateString()
                      : "Not selected"
                  } · ${formData.preferredTime || "No time selected"}`}
                />
              </div>

              {pricing && (
                <div className="overflow-hidden rounded-[28px] border border-[#8f6b2f] bg-[#0c0a07]">
                  <div className="border-b border-[#3a2812] px-6 py-5">
                    <h3 className="font-serif text-2xl text-white">
                      Booking Summary
                    </h3>

                    <p className="mt-2 text-sm text-[#cfc7b7]">
                      Pricing is calculated based on service, BHK, and total
                      area.
                    </p>
                  </div>

                  <div className="space-y-5 px-6 py-6">
                    <SummaryRow label="Service" value={pricing.serviceLabel} />
                    <SummaryRow label="Home Size" value={pricing.homeSize} />
                    <SummaryRow
                      label="Entered Area"
                      value={`${pricing.totalSqft} sqft`}
                    />
                    <SummaryRow
                      label="Included Area"
                      value={`${pricing.includedSqft} sqft`}
                    />
                    <SummaryRow
                      label="Extra Area"
                      value={`${pricing.extraSqft} sqft`}
                    />
                    <SummaryRow
                      label="Extra Area Charge"
                      value={`$${pricing.extraSqftCharge}`}
                    />

                    <div className="border-t border-[#3a2812] pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-[#f3eadb]">
                          Total Due
                        </span>

                        <span className="font-serif text-4xl text-[#d6ab5f]">
                          ${pricing.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-[24px] border border-[#2f291d] bg-[#111111] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8f8778]">
                  Special Notes
                </p>

                <p className="mt-3 text-sm leading-7 text-[#f3eadb]">
                  {formData.specialNotes || "No special notes added."}
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="rounded-2xl border border-[#5b5141] px-6 py-3 text-sm font-medium text-[#b8ad9a] transition hover:border-[#8f6b2f] hover:text-[#e3bd74]"
              >
                Cancel
              </a>

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
                disabled={isSubmitting || !pricing}
                className="rounded-2xl bg-[#d6ab5f] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Preparing Checkout..." : "Continue to Payment"}
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

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#d8d0c1]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        className={`${inputClass} resize-none`}
      />
    </label>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#d8d0c1]">
        {label}
      </span>

      <DatePicker
        selected={value}
        onChange={onChange}
        minDate={new Date()}
        placeholderText="Select preferred date"
        dateFormat="MMMM d, yyyy"
        className={inputClass}
        wrapperClassName="w-full"
      />
    </label>
  );
}

function CompactReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#2f291d] bg-[#111111] p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f8778]">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-[#f3eadb]">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-sm uppercase tracking-[0.18em] text-[#8f8778]">
        {label}
      </span>

      <span className="text-base text-[#f1e7d7]">{value}</span>
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-[#2f291d] bg-[#111111] px-4 py-4 text-sm text-white placeholder:text-[#8f8778] outline-none transition focus:border-[#d6ab5f]";