import * as React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Head from 'next/head'
import { siteTitle } from '../../config/server'
import '../../scss/style.scss'

type Props = {
  pageTitle?: string
}

const Layout: React.FunctionComponent<Props> = ({
  children,
  pageTitle = siteTitle
}) => (
    <section>
      <Head>
      <title>{siteTitle} | {pageTitle}</title>
      </Head>
      <header>
        <Navbar />
      </header>
      {children}
      <Footer />
    </section>
  )

export default Layout