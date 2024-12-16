import Link from "next/link";

import { Button } from "./ui/button";

export const QuickLink = ({ text, href }: { text: string; href: string }) => (
  <Button asChild variant="link" className="text-[#841729]">
    <Link className="text-[11px] font-semibold uppercase" href={href}>
      {text}
    </Link>
  </Button>
);
