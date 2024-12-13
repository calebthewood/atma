import * as sgMail from "@sendgrid/mail";

export async function sendEmail() {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const msg = {
    to: "calebwood.dev@gmail.com", // Change to your recipient
    from: "noreply@atmareserve.com", // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    templateId: "d-d63528eea2fc4cbca0e140d577e1ccb5",
    dynamicTemplateData: {
      checkin: "88/88/8888",
      checkout: "88/88/8888",
      hotel_name: "Lucky Gold Cat",
      location: "Hong Kong",
      price: "$8,8888",
    },
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
  return true;
}
