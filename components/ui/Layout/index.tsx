import * as React from 'react'
import NavMenu from '../NavMenu'
import Footer from '../Footer'
import Head from 'next/head'
import { siteTitle } from '../../../config/server'
import '../../../scss/style.scss' // Global style
import './style.scss'

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
        <NavMenu />
      </header>
      {children}
      <Footer />
    </section>
  )

export default Layout