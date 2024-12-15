export default function SubscriptionSection() {
  return (
    <div className="mx-auto h-96 w-full max-w-3xl bg-[#f4f1ea]">
      <div className="text-left font-broad text-[35px] font-semibold text-black">
        Your wellness journey starts here
      </div>
      <div className="text-right font-broad text-[35px] font-semibold text-black">
        Stay connected with us
      </div>
      <div className="my-12 flex flex-row justify-center">
        {/* convert to dialog */}
        <div className="mx-auto inline-flex h-[42.80px] items-center justify-start gap-[11.39px] rounded-[67px] border border-[#841729] bg-[#841729] px-[26.13px] py-[13.40px]">
          <div className="font-['Instrument Sans'] text-[13px] font-semibold uppercase text-white">
            SUBSCRIBE
          </div>
        </div>
      </div>
    </div>
  );
}
