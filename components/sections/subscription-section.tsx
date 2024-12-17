import NewsletterSubscribe from "../newsletter-subscribe";

export default function SubscriptionSection() {
  return (
    <div className="mx-auto my-32 flex w-full max-w-3xl flex-col gap-4">
      <div className="text-left font-broad text-4xl font-semibold">
        Your wellness journey starts here
      </div>
      <div className="text-right font-broad text-4xl font-semibold">
        Stay connected with us
      </div>
      <NewsletterSubscribe />
    </div>
  );
}
