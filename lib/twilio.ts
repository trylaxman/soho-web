import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const twilioVerifyServiceSid =
  process.env.TWILIO_VERIFY_SERVICE_SID!;

export const twilioMessagingServiceSid =
  process.env.TWILIO_MESSAGING_SERVICE_SID!;

export async function sendSms({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  try {
    const message = await twilioClient.messages.create({
      messagingServiceSid: twilioMessagingServiceSid,
      to,
      body,
    });

    console.log("TWILIO_SMS_ACCEPTED", {
      sid: message.sid,
      status: message.status,
      to,
      body,
    });

    return true;
  } catch (error) {
    console.error("TWILIO_SMS_ERROR", error);
    return false;
  }
}

export function getBookingCreatedSmsBody({
  date,
  time,
}: {
  date: string;
  time: string;
}) {
  return `SoHo Cleaning Group: Your cleaning is reserved for ${date} at ${time}. Your card has been authorized but not charged. Payment will be captured after the cleaning is completed.`;
}

export function getPaymentCapturedSmsBody({
  amount,
  currency = "USD",
}: {
  amount: number;
  currency?: string;
}) {
  return `SoHo Cleaning Group: Your cleaning payment of ${currency} ${amount.toFixed(
    2
  )} has been successfully charged. Thank you for choosing SoHo Cleaning Group.`;
}

export function getProfessionalApplicationReceivedSmsBody() {
  return "SoHo Cleaning Group: We have received your professional application. Our team will review your profile and documents and contact you shortly.";
}

export function getBookingStatusSmsBody(status: string) {
  const messages: Record<string, string> = {
    PENDING:
      "SoHo Cleaning Group: Your booking is pending review. We will update you shortly.",

    CONFIRMED:
      "SoHo Cleaning Group: Your booking has been confirmed. A cleaning professional will be assigned soon.",

    ASSIGNED:
      "SoHo Cleaning Group: A cleaning professional has been assigned to your booking.",

    COMPLETED:
      "SoHo Cleaning Group: Your cleaning service has been marked as completed. Thank you for choosing SoHo Cleaning Group.",

    CANCELLED:
      "SoHo Cleaning Group: Your booking has been cancelled and the card authorization has been released. Your bank may take some time to remove the pending hold.",
  };

  return (
    messages[status] ||
    `SoHo Cleaning Group: Your booking status has been updated to ${status}.`
  );
}