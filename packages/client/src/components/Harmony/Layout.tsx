import { ThemeProvider } from '@material-ui/styles'
import { Alerts } from '@xrengine/client-core/src/common/components/Alerts'
import { UIDialog } from '@xrengine/client-core/src/common/components/Dialog/Dialog'
import { AppAction } from '@xrengine/client-core/src/common/reducers/app/AppActions'
import { useAppState } from '@xrengine/client-core/src/common/reducers/app/AppState'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { theme } from '@xrengine/client-core/src/theme'
import { Config } from '@xrengine/common/src/config'
import { Helmet } from 'react-helmet'
import React, { Fragment, useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import Harmony from '.'
import LeftDrawer from '../Drawer/Left'
import RightDrawer from '../Drawer/Right'
// import Harmony from './Harmony'

const siteTitle: string = Config.publicRuntimeConfig.siteTitle

const initialSelectedUserState = {
  id: '',
  name: '',
  userRole: '',
  identityProviders: [],
  relationType: {},
  inverseRelationType: {},
  avatarUrl: ''
}

const initialGroupForm = {
  id: '',
  name: '',
  groupUsers: [],
  description: ''
}

interface Props {
  authState?: any
  login?: boolean
  pageTitle: string
  children?: any
}

const Layout = (props: Props): any => {
  const { pageTitle, children } = props

  const dispatch = useDispatch()
  const userHasInteracted = useAppState().userHasInteracted
  const authUser = useAuthState().authUser
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false)
  const [harmonyOpen, setHarmonyOpen] = useState(false)
  const [detailsType, setDetailsType] = useState('')
  const [groupFormOpen, setGroupFormOpen] = useState(false)
  const [groupFormMode, setGroupFormMode] = useState('')
  const [groupForm, setGroupForm] = useState(initialGroupForm)
  const [selectedUser, setSelectedUser] = useState(initialSelectedUserState)
  const [selectedGroup, setSelectedGroup] = useState(initialGroupForm)
  const user = useAuthState().user

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as any, { harmonyOpen: harmonyOpen })
    }
    return child
  })

  const initialClickListener = () => {
    dispatch(AppAction.setUserHasInteracted())
    window.removeEventListener('click', initialClickListener)
    window.removeEventListener('touchend', initialClickListener)
  }

  useEffect(() => {
    if (userHasInteracted.value === false) {
      window.addEventListener('click', initialClickListener)
      window.addEventListener('touchend', initialClickListener)
    }

    dispatch(AuthService.doLoginAuto(true))
  }, [])

  //info about current mode to conditional render menus
  // TODO: Uncomment alerts when we can fix issues

  return (
    <ThemeProvider theme={theme}>
      <section>
        <Helmet>
          <title>
            {siteTitle} | {pageTitle}
          </title>
        </Helmet>
        {/* <Harmony /> */}
        <Harmony
          isHarmonyPage={true}
          setHarmonyOpen={setHarmonyOpen}
          setDetailsType={setDetailsType}
          setGroupFormOpen={setGroupFormOpen}
          setGroupFormMode={setGroupFormMode}
          setGroupForm={setGroupForm}
          setSelectedUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
          setLeftDrawerOpen={setLeftDrawerOpen}
          setRightDrawerOpen={setRightDrawerOpen}
        />

        <Fragment>
          <UIDialog />
          <Alerts />
          {childrenWithProps}
        </Fragment>
        {authUser?.accessToken?.value != null &&
          authUser.accessToken.value.length > 0 &&
          user?.id?.value != null &&
          user.id.value.length > 0 && (
            <Fragment>
              <LeftDrawer
                harmony={true}
                detailsType={detailsType}
                setDetailsType={setDetailsType}
                groupFormOpen={groupFormOpen}
                setGroupFormOpen={setGroupFormOpen}
                groupFormMode={groupFormMode}
                setGroupFormMode={setGroupFormMode}
                groupForm={groupForm}
                setGroupForm={setGroupForm}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                openBottomDrawer={bottomDrawerOpen}
                leftDrawerOpen={leftDrawerOpen}
                setLeftDrawerOpen={setLeftDrawerOpen}
                setRightDrawerOpen={setRightDrawerOpen}
                setBottomDrawerOpen={setBottomDrawerOpen}
              />
            </Fragment>
          )}
        {/* {authUser?.accessToken.value != null && authUser.accessToken.value.length > 0 && user?.id.value != null && ( */}
        <Fragment>
          {/* <InviteHarmony /> */}
          <RightDrawer rightDrawerOpen={rightDrawerOpen} setRightDrawerOpen={setRightDrawerOpen} />
        </Fragment>
        {/* )} */}
      </section>
    </ThemeProvider>
  )
}

export default Layout
