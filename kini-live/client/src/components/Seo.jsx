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
  const currentPath = routeMeta[pathname] ? pathname : "/";
  const meta = routeMeta[currentPath];
  const canonical = canonicalFor(currentPath);
  const noindex = currentPath.startsWith("/admin");

  const jsonLd =
    currentPath === "/"
      ? [organizationJsonLd, webpageJsonLd(currentPath)]
      : [webpageJsonLd(currentPath)];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en-IN" />

      {/* Primary SEO */}
      <title>{meta.title}</title>

      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta name="author" content={SITE_NAME} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex,nofollow"
            : "index,follow,max-image-preview:large"
        }
      />

      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:alt" content="KINi Outsourcing Services Logo" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />
      <meta
        name="twitter:image:alt"
        content="KINi Outsourcing Services Logo"
      />

      {/* Structured Data */}
      {jsonLd.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}

export default Seo;