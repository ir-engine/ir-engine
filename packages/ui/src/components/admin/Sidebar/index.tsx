import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import SidebarItems from '@etherealengine/client-core/src/admin/sidebarItems'
import Divider from '@etherealengine/ui/src/primitives/mui/Divider'
import List from '@etherealengine/ui/src/primitives/mui/List'
import ListItem from '@etherealengine/ui/src/primitives/mui/ListItem'
import ListItemIcon from '@etherealengine/ui/src/primitives/mui/ListItemIcon'
import ListItemText from '@etherealengine/ui/src/primitives/mui/ListItemText'

import styles from './index.module.scss'

const Sidebar = ({ allowedRoutes }) => {
  const location = useLocation()
  const { pathname } = location

  const { t } = useTranslation()

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

Sidebar.defaultProps = {
  allowedRoutes: {
    analytics: true,
    location: true,
    user: true,
    bot: true,
    scene: true,
    party: true,
    groups: true,
    instance: true,
    invite: true,
    globalAvatars: true,
    static_resource: true,
    benchmarking: true,
    routes: true,
    projects: true,
    settings: true,
    server: true,
    recording: true
  }
}

Sidebar.displayName = 'Sidebar'

export default Sidebar
