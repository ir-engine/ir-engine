import * as React from 'react'
import Head from 'next/head'
import Navbar from './Navbar'
import Footer from './Footer'

type Props = {
  title?: string
}

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = 'XRChat',
}) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <header>
      <Navbar />
    </header>
    {children}
    <Footer />
  </div>
)

export default Layout