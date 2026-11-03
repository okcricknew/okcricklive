import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="preload"
          as="image"
          href="/images/okcrick-logoC.webp"
          fetchPriority="high"
        />

            {/* Primary Favicon */}
<link
  rel="icon"
  type="image/webp"
  href="/favicon.webp"
/>
    
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
