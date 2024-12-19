import NewsletterSubscribe from "../newsletter-subscribe";

export default function SubscriptionSection() {
  return (
    <div className="px-5 md:mx-auto my-32 flex w-full max-w-3xl flex-col gap-4">
      <div className="text-left font-broad text-lg md:text-4xl font-semibold">
        Your wellness journey starts here
      </div>
      <div className="text-right font-broad text-lg md:text-4xl font-semibold">
        Stay connected with us
      </div>
      <NewsletterSubscribe />
    </div>
  );
}
