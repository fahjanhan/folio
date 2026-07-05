'use client';

import Script from 'next/script';

const SERVER_ORIGIN = 'https://townsquare.cauenapier.com';
const SITE_KEY = 'site_rKjs_d1DBgTD9eZM';

export default function TownSquareWidget() {
  return (
    <>
      {/* Next.js hoists <link> tags rendered in a component into <head> */}
      <link rel="preconnect" href={SERVER_ORIGIN} crossOrigin="" />
      <link rel="stylesheet" href={`${SERVER_ORIGIN}/widget.css`} />

      <div id="townsquare-root" />

      <Script
        id="townsquare-mount"
        type="module"
        strategy="afterInteractive"
      >
        {`
          import("${SERVER_ORIGIN}/townsquare.mjs").then(({ mountTownSquare }) => {
            const root = document.getElementById("townsquare-root");
            if (root) {
              mountTownSquare(root, {
                serverOrigin: "${SERVER_ORIGIN}",
                siteKey: "${SITE_KEY}",
                theme: "host",
              });
            }
          });
        `}
      </Script>
    </>
  );
}