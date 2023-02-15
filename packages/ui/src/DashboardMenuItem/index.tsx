import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import Divider from '@xrengine/ui/src/Divider'
import List from '@xrengine/ui/src/List'
import ListItem from '@xrengine/ui/src/ListItem'
import ListItemIcon from '@xrengine/ui/src/ListItemIcon'
import ListItemText from '@xrengine/ui/src/ListItemText'

// import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { SidebarItems } from '../DashboardItems'
import styles from './index.module.scss'

interface Props {
  //authState?: any
  location: any
}

const DashboardMenuItem = () => {
  const location = useLocation()
  const { pathname } = location
  // const scopes = useAuthState().user?.scopes?.value || []
  const scopes = []
  const { t } = useTranslation()

  let allowedRoutes = {
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
    server: false
  }

  scopes.forEach((scope) => {
    if (Object.keys(allowedRoutes).includes(scope.type.split(':')[0])) {
      if (scope.type.split(':')[1] === 'read') {
        allowedRoutes = {
          ...allowedRoutes,
          [scope.type.split(':')[0]]: true
        }
      }
    }
  })

  return (
    <>
      <Divider />
      <List>
        {SidebarItems(allowedRoutes)
          .filter(Boolean)
          .map((sidebarItem, index) => {
            return (
              <Link key={index} to={sidebarItem.path} className={styles.textLink} title={t(sidebarItem.name)}>
                <ListItem
                  classes={{ selected: styles.selected }}
                  style={{ color: 'var(--iconButtonColor)' }}
                  selected={sidebarItem.path === pathname}
                  button
                >
                  <ListItemIcon className={styles.drawerIconColor}>{sidebarItem.icon}</ListItemIcon>
                  <ListItemText primary={t(sidebarItem.name)} />
                </ListItem>
              </Link>
            )
          })}
      </List>
    </>
  )
}

export default DashboardMenuItem
