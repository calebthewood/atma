export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "atma",
  description: "Unleash your potential.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Login",
      href: "/authentication",
    },
    {
      title: "Admin",
      href: "/admin",
    },
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/calebthewood/",
    docs: "https://ui.shadcn.com",
  },
};
