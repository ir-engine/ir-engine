import React, { Fragment, useState, useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
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
import { selectAuthState } from '../../../redux/auth/selector'

const { publicRuntimeConfig } = getConfig()
const siteTitle: string = publicRuntimeConfig.siteTitle

interface Props {
    authState?: any,
    pageTitle: string
    children: any
}
const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({})

const Layout = (props: Props): any => {
    const { pageTitle, children, authState } = props
    const authUser = authState.get('authUser')
    const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
    const [topDrawerOpen, setTopDrawerOpen] = useState(false)
    const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false)

    const openRightDrawer = (targetObjectType?: string, targetObjectId?: string) => {
        setLeftDrawerOpen(false)
        setTopDrawerOpen(false)
        setBottomDrawerOpen(false)
        setRightDrawerOpen(false)
    }

    console.log(authUser)

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
            { authUser != null && authUser.accessToken != null && authUser.accessToken.length > 0 &&
                <Fragment>
                    <LeftDrawer leftDrawerOpen={leftDrawerOpen} setLeftDrawerOpen={setLeftDrawerOpen} setRightDrawerOpen={setRightDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen}/>
                </Fragment>
            }
            { authUser != null && authUser.accessToken != null && authUser.accessToken.length > 0 &&
				<Fragment>
					<RightDrawer rightDrawerOpen={rightDrawerOpen} setRightDrawerOpen={setRightDrawerOpen}/>
				</Fragment>
            }
            <footer>
                { authState.get('authUser') != null && leftDrawerOpen === false && rightDrawerOpen === false && topDrawerOpen === false && bottomDrawerOpen === false && <DrawerControls setLeftDrawerOpen={setLeftDrawerOpen} setBottomDrawerOpen={setBottomDrawerOpen}/> }
            </footer>
        </section>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout)
