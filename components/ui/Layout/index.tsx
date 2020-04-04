import * as React from 'react'
import NavMenu from '../NavMenu'
import Footer from '../Footer'
import Head from 'next/head'
import { siteTitle } from '../../../config/server'
import '../../../scss/style.scss' // Global style
import './style.scss'

type Props = {
  pageTitle: string
  children: any
}

class Layout extends React.Component<Props> {
  render() {
    return (
      <section>
        <Head>
          <title>
            {siteTitle} | {this.props.pageTitle}
          </title>
        </Head>
        <header>
          <NavMenu />
        </header>
        {this.props.children}
        <Footer />
      </section>
    )
  }
}

export default Layout
