export const SITE_URL = "https://kinios.in";
export const SITE_NAME = "KINi Outsourcing Services";
export const DEFAULT_IMAGE = `${SITE_URL}/kini-logo.jpeg`;
export const BUSINESS_EMAIL = "kinioutsourcingservices@gmail.com";
export const BUSINESS_PHONE = "+919920515701";
export const BUSINESS_ADDRESS = {
  streetAddress: "Mumbai",
  addressLocality: "Mumbai",
  addressRegion: "Maharashtra",
  postalCode: "400001",
  addressCountry: "IN",
};

// SEO route map used by react-helmet-async for titles, descriptions, canonical URLs, and social previews.
export const routeMeta = {
  "/": {
    target: "home",
    title: "KINi Outsourcing Services | Tax Consultant in Mumbai",
    description:
      "KINi Outsourcing Services provides reliable accounting, income tax return, GST, TDS, company incorporation, licensing and compliance support for businesses and individuals.",
    keywords:
      "KINi Outsourcing Services, tax consultant Mumbai, accounting services, income tax return filing, GST returns, TDS filing, company incorporation, labour law compliance, licensing consultant",
  },
  "/services": {
    target: "services",
    title: "Accounting, GST, TDS & Tax Filing Services | KINi Outsourcing",
    description:
      "Explore accounting, income tax returns, GST returns, TDS filing, company incorporation, labour law compliance, licensing and tax consultancy services from KINi Outsourcing.",
    keywords:
      "accounting services, GST return filing, TDS filing, income tax returns, company incorporation, licensing consultancy, tax consultancy, compliance services",
  },
  "/about": {
    target: "about",
    title: "About Hariom M. Pandey | KINi Outsourcing Services",
    description:
      "Learn about Hariom M. Pandey, Founder and Tax Consultant at KINi Outsourcing Services, focused on accurate, confidential and timely financial compliance support.",
    keywords:
      "Hariom M Pandey, KINi Outsourcing founder, tax consultant, financial compliance, accounting consultant",
  },
  "/contact": {
    target: "contact",
    title: "Contact KINi Outsourcing Services | Tax Consultant",
    description:
      "Contact KINi Outsourcing Services for accounting, GST, TDS, tax filing, company incorporation, licensing and compliance consultation.",
    keywords:
      "contact KINi Outsourcing Services, tax consultant contact, GST consultant, accounting services contact, compliance consultancy",
  },
  "/faqs": {
    target: "faqs",
    title: "FAQs | Accounting, Tax & Compliance Support | KINi Outsourcing",
    description:
      "Read FAQs about consultations, accounting, income tax filing, GST returns, TDS filing and compliance support from KINi Outsourcing Services.",
    keywords:
      "tax filing FAQs, GST filing FAQs, accounting consultation questions, compliance support FAQs, KINi Outsourcing FAQs",
  },
};

export function canonicalFor(pathname) {
  return `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
}

// JSON-LD structured data helps search engines understand the business entity and service coverage.
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "AccountingService"],
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: DEFAULT_IMAGE,
  image: DEFAULT_IMAGE,
  email: BUSINESS_EMAIL,
  telephone: BUSINESS_PHONE,
  founder: {
    "@type": "Person",
    name: "Hariom M. Pandey",
    jobTitle: "Founder and Tax Consultant",
  },
  address: {
    "@type": "PostalAddress",
    ...BUSINESS_ADDRESS,
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  description:
    "Professional accounting, tax, GST, TDS, company incorporation, licensing and compliance support for businesses, professionals and individuals.",
  sameAs: [
    "https://www.linkedin.com/company/kini-outsourcing-services",
    "https://www.facebook.com/kinioutsourcingservices",
    "https://www.instagram.com/kinioutsourcingservices",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    contactType: "customer support",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
  makesOffer: [
    "Accounting",
    "Income Tax Returns",
    "GST Returns",
    "TDS Filing",
    "Company Incorporation",
    "Labour Law Compliances",
    "Licensing and Tax Consultancy",
  ].map((name) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name,
      provider: { "@id": `${SITE_URL}/#business` },
    },
  })),
};

export function webpageJsonLd(pathname) {
  const meta = routeMeta[pathname] || routeMeta["/"];
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalFor(pathname)}#webpage`,
    url: canonicalFor(pathname),
    name: meta.title,
    description: meta.description,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: { "@id": `${SITE_URL}/#business` },
  };
}
