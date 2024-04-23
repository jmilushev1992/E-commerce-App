/* eslint-disable linebreak-style */
// eslint-disable-next-line no-multiple-empty-lines

/* eslint-disable react/no-danger */
import React from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import PropTypes from 'prop-types';

import createEmotionServer from '@emotion/server/create-instance';
import createCache from '@emotion/cache';

// PropTypes for MyDocument component
const propTypes = {
  styles: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.element,
      PropTypes.object,
    ]),
  ).isRequired,
};

// Custom document component to modify the initial HTML document served from the Next.js server
const MyDocument = ({ styles }) => {
  return (
    <Html lang="en" style={{ height: '100%' }}>
      <Head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="google" content="notranslate" />
        <meta name="theme-color" content="#1976D2" />
        
        {/* Favicon */}
        <link rel="shortcut icon" href="https://storage.googleapis.com/builderbook/favicon32.png" />

        {/* External stylesheets */}
        <link rel="stylesheet" href="/fonts/server.css" />
        <link rel="stylesheet" href="https://storage.googleapis.com/builderbook/vs.min.css" />

        {/* Inline styles */}
        <style>
          {`
              a {
                font-weight: 400;
                color: #58a6ff;
                text-decoration: none;
                outline: none;
              }
              blockquote {
                padding: 0 1em;
                color: #555;
                border-left: 0.25em solid #dfe2e5;
              }
              pre {
                display:block;
                overflow-x:auto;
                padding:0.5em;
                background:#FFF;
                color: #000;
                border: 1px solid #ddd;
                font-size: 14px;
              }
              code {
                font-size: 14px;
                background: #FFF;
              }
            `}
        </style>

        {/* Google Analytics script */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* Inject styles first to match with the prepend: true configuration. */}
        {styles}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

// Get initial props for server-side rendering
MyDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;
  const cache = createCache({ key: 'css' });
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => <App emotionCache={cache} {...props} />,
    });

  const initialProps = await Document.getInitialProps(ctx);
  const chunks = extractCriticalToChunks(initialProps.html);

  const emotionStyleTags = chunks.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [...React.Children.toArray(initialProps.styles), ...emotionStyleTags],
  };
};

MyDocument.propTypes = propTypes;

export default MyDocument;
