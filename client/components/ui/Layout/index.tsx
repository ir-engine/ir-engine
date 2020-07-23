import React, { Fragment, useState, useEffect } from 'react'
import getConfig from 'next/config'
import NavMenu from '../NavMenu'
import Head from 'next/head'
import './style.scss'
import Alerts from '../Common/Alerts'
import UIDialog from '../Dialog/Dialog'
import DrawerControls from '../DrawerControls'
import LeftDrawer from '../Drawer/Left'
import RightDrawer from '../Drawer/Right'
import TopDrawer from '../Drawer/Top'
import BottomDrawer from '../Drawer/Bottom'

const { publicRuntimeConfig } = getConfig()
const siteTitle: string = publicRuntimeConfig.siteTitle

interface Props {
  pageTitle: string
  children: any
}

const Layout = (props: Props): any => {
  const { pageTitle, children } = props
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [topDrawerOpen, setTopDrawerOpen] = useState(false)
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false)

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
      <Fragment>
         <LeftDrawer leftDrawerOpen={leftDrawerOpen} setLeftDrawerOpen={setLeftDrawerOpen}/>
      </Fragment>
      <footer>
          { leftDrawerOpen === false && rightDrawerOpen === false && topDrawerOpen === false && bottomDrawerOpen === false && <DrawerControls setLeftDrawerOpen={setLeftDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen}/> }
      </footer>
    </section>
  )
}

export default Layout
