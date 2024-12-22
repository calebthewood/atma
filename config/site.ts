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
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/calebthewood/",
    docs: "https://ui.shadcn.com",
  },
};

export const errorPayloads = {
  notFound: {
    ok: false,
    message: "User not found",
    data: null,
    error: {
      code: "USER_NOT_FOUND",
    },
  },
  notAuth: {
    ok: false,
    message: "User not authorized",
    data: null,
    error: {
      code: "USER_NOT_AUTHORIZED",
    },
  },
  missingHostId: {
    ok: false,
    message: "Host ID is required",
    data: null,
    error: {
      code: "MISSING_HOST_ID",
    },
  },
};
