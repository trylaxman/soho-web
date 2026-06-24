import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

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
      body
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
  return `SoHo Cleaning Group: Cleaning has been booked for ${date} at ${time}. A professional will be assigned soon.`;
}

export function getProfessionalApplicationReceivedSmsBody() {
  return "SoHo Cleaning Group: We have received your professional application. Our team will review your profile and documents and contact you shortly.";
}

export function getBookingStatusSmsBody(status: string) {
  const messages: Record<string, string> = {
    PENDING:
      "SoHo Cleaning Group: Your booking is now pending review. We will update you shortly.",
    CONFIRMED:
      "SoHo Cleaning Group: Your booking has been confirmed. A professional will be assigned soon.",
    ASSIGNED:
      "SoHo Cleaning Group: A cleaning professional has been assigned to your booking.",
    COMPLETED:
      "SoHo Cleaning Group: Your cleaning service has been completed. Thank you for choosing SoHo.",
    CANCELLED:
      "SoHo Cleaning Group: Your booking has been cancelled. Please contact us if this was a mistake.",
  };

  return (
    messages[status] ||
    `SoHo Cleaning Group: Your booking status has been updated to ${status}.`
  );
}