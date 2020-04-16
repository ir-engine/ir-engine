import getConfig from 'next/config'
import * as React from 'react'
import NavMenu from '../NavMenu'
import Footer from '../Footer'
import Head from 'next/head'
import '../../../scss/style.scss' // Global style
import './style.scss'

const { publicRuntimeConfig } = getConfig()
const siteTitle: string = publicRuntimeConfig.siteTitle


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
          <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js"></script>
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
