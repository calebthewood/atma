import Link from "next/link";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col gap-3 border-t py-6 sm:px-4 md:px-8 lg:px-12">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <Link
          href="/"
          className="font-broad text-2xl font-bold tracking-[5px] text-[#44301f] hover:opacity-80"
        >
          ATMA
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          <Link
            href="/destinations"
            className="text-sm font-semibold text-[#44301f] hover:opacity-80"
          >
            Destinations
          </Link>
          <Link
            href="/retreats"
            className="text-sm font-semibold text-[#44301f] hover:opacity-80"
          >
            Retreats
          </Link>
          <Link
            href="/programs"
            className="text-sm font-semibold text-[#44301f] hover:opacity-80"
          >
            Programs
          </Link>
          <Link
            href="/contact"
            className="text-sm font-semibold text-[#44301f] hover:opacity-80"
          >
            Contact
          </Link>
        </nav>
      </div>

      <div className="h-px w-full bg-black/20" />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-[#44301f]">
          Inspiration for future getaways
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/faq"
            className="text-xs font-medium text-[#44301f] hover:opacity-80"
          >
            FAQ
          </Link>
          <Link
            href="/newsletter"
            className="text-xs font-medium text-[#44301f] hover:opacity-80"
          >
            Newsletter
          </Link>
          <Link
            href="/support"
            className="text-xs font-medium text-[#44301f] hover:opacity-80"
          >
            Customer Support
          </Link>
          <a
            target="_blank"
            href="https://www.instagram.com/atma.reserve/"
            className="text-xs font-medium text-[#44301f] hover:opacity-80"
          >
            Instagram
          </a>
        </div>
      </div>

      <div className="h-px w-full bg-black/20" />

      <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-black/50">
        <span>© {currentYear} ATMA Reserve.</span>
        <div className="size-[3px] rounded-full bg-black/50" />
        <Link href="/privacy" className="hover:text-black/70">
          Privacy
        </Link>
        <div className="size-[3px] rounded-full bg-black/50" />
        <Link href="/terms" className="hover:text-black/70">
          Terms
        </Link>
        <div className="size-[3px] rounded-full bg-black/50" />
        <Link href="/sitemap" className="hover:text-black/70">
          Sitemap
        </Link>
      </div>
    </footer>
  );
}
