import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  calculateCleaningPrice,
  type CleaningType,
  type HomeSize,
} from "@/lib/pricing/cleaning-pricing";

const addOnOptions = [
  {
    id: "INSIDE_FRIDGE",
    label: "Inside Fridge Cleaning",
    price: 40,
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const pricing = calculateCleaningPrice({
      cleaningType: body.cleaningType as CleaningType,
      homeSize: body.homeSize as HomeSize,
      totalSqft: Number(body.totalSqft),
    });

    const selectedAddOns = Array.isArray(body.selectedAddOns)
      ? addOnOptions.filter((addOn) => body.selectedAddOns.includes(addOn.id))
      : [];

    const addOnTotal = selectedAddOns.reduce(
      (sum, addOn) => sum + addOn.price,
      0
    );

    const finalTotal = Number((pricing.total + addOnTotal).toFixed(2));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const addOnDescription = selectedAddOns.length
      ? ` Add-ons: ${selectedAddOns
          .map((addOn) => `${addOn.label} (+$${addOn.price})`)
          .join(", ")}.`
      : "";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: body.email,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/onboarding/user`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(finalTotal * 100),
            product_data: {
              name: `${pricing.serviceLabel} - ${pricing.homeSize}`,
              description: `Included area: ${pricing.includedSqft} sqft. Total area: ${pricing.totalSqft} sqft.${addOnDescription}`,
            },
          },
        },
      ],
      metadata: {
        fullName: body.fullName || "",
        email: body.email || "",
        phone: body.phone || "",
        address: body.address || "",
        apartment: body.apartment || "",
        city: body.city || "",
        state: body.state || "",
        zipCode: body.zipCode || "",
        cleaningType: body.cleaningType || "",
        homeSize: body.homeSize || "",
        totalSqft: String(body.totalSqft || ""),
        bedrooms: String(body.bedrooms || ""),
        bathrooms: String(body.bathrooms || ""),
        kitchens: String(body.kitchens || ""),
        frequency: body.frequency || "",
        preferredDate: body.preferredDate || "",
        preferredTime: body.preferredTime || "",
        hasPets: body.hasPets === true ? "true" : "false",
        selectedAddOns: selectedAddOns.map((addOn) => addOn.id).join(","),
        selectedAddOnLabels: selectedAddOns.map((addOn) => addOn.label).join(", "),
        addOnTotal: String(addOnTotal),
        specialNotes: body.specialNotes || "",
        calculatedTotal: String(finalTotal),
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("CREATE_CHECKOUT_SESSION_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create checkout session.",
      },
      { status: 500 }
    );
  }
}