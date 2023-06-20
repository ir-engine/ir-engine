/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import clsx from 'clsx'
import React, { useEffect, useState } from 'react'

import { PopupMenuInline } from '@etherealengine/client-core/src/user/components/UserMenu/PopupMenuInline'
import { PopupMenuServices } from '@etherealengine/client-core/src/user/components/UserMenu/PopupMenuService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { UserMenus } from '@etherealengine/client-core/src/user/UserUISystem'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Sidebar from '@etherealengine/ui/src/components/admin/Sidebar'
import AppBar from '@etherealengine/ui/src/primitives/mui/AppBar'
import Drawer from '@etherealengine/ui/src/primitives/mui/Drawer'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { useTheme } from '@mui/material/styles'

import styles from './index.module.scss'

/**
 * Function for admin dashboard
 *
 * @param param0 children props
 * @returns @ReactDomElements
 */

const Dashboard = ({ children }) => {
  const authState = useHookstate(getMutableState(AuthState))
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const { user } = authState
  const { scopes } = user

  const [allowedRoutes, setAllowedRoutes] = useState({
    analytics: true,
    location: false,
    user: false,
    bot: false,
    scene: false,
    party: false,
    groups: false,
    instance: false,
    invite: false,
    globalAvatars: false,
    static_resource: false,
    benchmarking: false,
    routes: false,
    projects: false,
    settings: false,
    server: false,
    recording: false
  })

  useEffect(() => {
    const { value } = scopes
    if (value) {
      const routes = {
        ...allowedRoutes,
        ...(value?.length > 0
          ? value?.reduce((prevoius, current) => Object.assign({}, prevoius, { [current.type.split(':')[0]]: true }))
          : {}) // eslint-disable-line
      }
      setAllowedRoutes(routes)
    }
  }, [scopes])

  const handleClick = () => {
    PopupMenuServices.showPopupMenu(UserMenus.Profile)
  }

  const handleDrawerOpen = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setOpen(open)
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <PopupMenuInline />
      <AppBar position="fixed" className={styles.appBar}>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen(true)}
              edge="start"
              className={clsx(styles.menuButton, {
                [styles.hide]: open
              })}
              size="large"
              icon={<Icon type="Menu" />}
            />
            <div className={styles.appBarHeadingContainer}>
              <Typography variant="h6">Dashboard</Typography>

              <IconButton
                onClick={handleClick}
                className={styles.profileButton}
                disableRipple
                icon={
                  <>
                    <span>{user.name.value}</span>
                    <Icon type="Person" />
                  </>
                }
              />
            </div>
          </div>
        </nav>
      </AppBar>
      <Drawer
        variant={open ? 'temporary' : 'permanent'}
        className={clsx(styles.drawer, {
          [styles.drawerOpen]: open,
          [styles.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [styles.drawerOpen]: open,
            [styles.drawerClose]: !open
          })
        }}
        open={open}
        onClose={handleDrawerOpen(false)}
      >
        <div className={styles.toolbar}>
          <IconButton
            onClick={handleDrawerOpen(false)}
            style={{ color: 'var(--iconButtonColor)' }}
            size="large"
            icon={<Icon type={theme.direction === 'rtl' ? 'ChevronRight' : 'ChevronLeft'} />}
          />
        </div>
        <Sidebar />
      </Drawer>
      <main
        className={clsx(styles.content, {
          [styles.contentWidthDrawerOpen]: open,
          [styles.contentWidthDrawerClosed]: !open
        })}
      >
        {children}
      </main>
    </div>
  )
}

Dashboard.displayName = 'Dashboard'

Dashboard.defaultProps = {
  children: <div>hello</div>,
  user: {
    name: {
      value: 'default name'
    }
  }
}

export default Dashboard
