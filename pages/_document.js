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

            {/* Favicon */}
<link
  rel="icon"
  href="/favicon.ico"
  sizes="any"
/>

<link
  rel="preload"
  as="image"
  href="/favicon.webp"
  fetchPriority="high"
/>
    
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
