import * as sgMail from "@sendgrid/mail";

const templates: { [key: string]: { id: string; fields: string[] } } = {
  modified: {
    id: "d-6e73f7dde1b44dcc8c900d4d67768dbb",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  refunded: {
    id: "d-74ea4cf635e24703a8f733cb4464a990",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  "requires-confirmation": {
    id: "d-32406afe5e8144b6ab761fdb54fa9205",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  failed: {
    id: "d-7e91aa13ae33423da7d58409646d087e",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  succeeded: {
    id: "d-bb63119b2f994006a9d8aad8cf6b29e5",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  canceled: {
    id: "d-1903fcb9c352498f966ac1c844d348d5",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  "requires-action": {
    id: "d-5b3e0325851043ef806ffe1d6e0918fe",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  "payment-processing": {
    id: "d-fb36e76781354dbbbe2cac9cb0ab98fd",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  "awaiting-payment": {
    id: "d-35fc2d656e324cf9a781872bd52abf56",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  confirmed: {
    id: "d-188d38ae9269431c83707410288eb08e",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
  pending: {
    id: "d-d63528eea2fc4cbca0e140d577e1ccb5",
    fields: [
      "checkin",
      "checkout",
      "retreat_name",
      "hotel_name",
      "location",
      "price",
    ],
  },
};

export async function sendEmail({
  template,
  payload,
  subject,
  to,
  from = "noreply@atmareserve.com",
}: {
  to: string;
  from?: string;
  template: string;
  subject?: string;
  payload: { [key: string]: string | Date };
}) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const msg = {
    to,
    from,
    subject,
    templateId: templates[template].id,
    dynamicTemplateData: { ...payload },
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.log(error);
    });
  return true;
}
