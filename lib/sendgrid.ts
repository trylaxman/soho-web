import sgMail from "@sendgrid/mail";

const sendGridApiKey = process.env.SENDGRID_API_KEY;

if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string[];
  subject: string;
  text: string;
  html: string;
}) {
  if (!sendGridApiKey) {
    console.error("SENDGRID_API_KEY_MISSING");
    return false;
  }

  if (to.length === 0) {
    console.warn("SENDGRID_NO_RECIPIENTS");
    return false;
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName =
    process.env.SENDGRID_FROM_NAME || "SoHo Cleaning Group";

  if (!fromEmail) {
    console.error("SENDGRID_FROM_EMAIL_MISSING");
    return false;
  }

  try {
    await sgMail.send({
      to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
      text,
      html,
    });

    console.log("SENDGRID_EMAIL_ACCEPTED", {
      to,
      subject,
    });

    return true;
  } catch (error) {
    console.error("SENDGRID_EMAIL_ERROR", error);
    return false;
  }
}