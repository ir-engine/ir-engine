import { Fragment } from 'react'
import getConfig from 'next/config'
import NavMenu from '../NavMenu'
import Head from 'next/head'
import './style.scss'
import Alerts from '../Common/Alerts'
import UIDialog from '../Dialog/Dialog'

const { publicRuntimeConfig } = getConfig()
const siteTitle: string = publicRuntimeConfig.siteTitle

type Props = {
  pageTitle: string
  children: any
}

const Layout = (props: Props) => {
  const { pageTitle, children } = props
  return (
    <section>
      <Head>
        <title>
          {siteTitle} | {pageTitle}
        </title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js" />
      </Head>
      <header>
        <NavMenu />
      </header>
      <Fragment>
        <UIDialog />
        <Alerts />
        {children}
      </Fragment>
    </section>
  )
}

export default Layout
