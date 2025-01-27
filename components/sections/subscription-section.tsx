
import NewsletterSubscribe from "../newsletter-subscribe";

export default function SubscriptionSection() {
  return (
    <div className="px-2 mb-24 mt-6 md:my-32 flex w-full max-w-3xl flex-col gap-4 sm:px-5 md:mx-auto">
      <div className="text-left font-broad text-lg font-semibold md:text-4xl">
        Your wellness journey starts here
      </div>
      <div className="text-right font-broad text-lg font-semibold md:text-4xl">
        Stay connected with us
      </div>
      <NewsletterSubscribe />
    </div>
  );
}
