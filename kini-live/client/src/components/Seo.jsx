import { Helmet } from "react-helmet-async";
import {
  DEFAULT_IMAGE,
  SITE_NAME,
  canonicalFor,
  organizationJsonLd,
  routeMeta,
  webpageJsonLd,
} from "../seo";

function Seo({ pathname = "/" }) {
  const normalizedPath = routeMeta[pathname] ? pathname : "/";
  const meta = routeMeta[normalizedPath];
  const canonical = canonicalFor(normalizedPath);
  const noindex = normalizedPath.startsWith("/admin");
  const jsonLd = normalizedPath === "/"
    ? [organizationJsonLd, webpageJsonLd(normalizedPath)]
    : [webpageJsonLd(normalizedPath)];

  return (
    <Helmet>
      {/* SEO: route-specific core metadata for Google Search, Search Console, and Lighthouse. */}
      <html lang="en-IN" />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={noindex ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large"} />
      <link rel="canonical" href={canonical} />

      {/* SEO: Open Graph metadata for Facebook, LinkedIn, WhatsApp, and other social previews. */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:alt" content="KINi Outsourcing Services logo" />
      <meta property="og:locale" content="en_IN" />

      {/* SEO: Twitter/X card metadata for link previews. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />
      <meta name="twitter:image:alt" content="KINi Outsourcing Services logo" />

      {/* SEO: JSON-LD structured data for entity understanding and Rich Results validation. */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}

export default Seo;
