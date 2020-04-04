import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { siteDescription } from '../config/server'

export default class RootDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <meta name="description" content={siteDescription} />
          <link rel="/_next/static/style.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
