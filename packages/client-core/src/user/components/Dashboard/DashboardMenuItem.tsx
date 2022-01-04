import React from 'react'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'

import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { Link, withRouter } from 'react-router-dom'
import { useStylesForDashboard } from './styles'
import ListSubheader from '@mui/material/ListSubheader'
import { useAuthState } from '../../services/AuthService'
import { SidebarItems, SocialSidebarItems } from './DashboardItems'

import { useTranslation } from 'react-i18next'

interface Props {
  authState?: any
  location: any
}

const DashboardMenuItem = (props: Props) => {
  const { location } = props
  const { pathname } = location
  const scopes = useAuthState().user?.scopes?.value || []
  const { t } = useTranslation()

  let allowedRoutes = {
    routes: true,
    location: false,
    user: false,
    bot: false,
    party: false,
    groups: false,
    instance: false,
    invite: false,
    globalAvatars: false,
    projects: false
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

  const classes = useStylesForDashboard()

  return (
    <>
      <Divider />
      <List>
        {SidebarItems(allowedRoutes)
          .filter(Boolean)
          .map((sidebarItem, index) => {
            return (
              <Link key={index} to={sidebarItem.path} className={classes.textLink}>
                <ListItem
                  classes={{ selected: classes.selected }}
                  style={{ color: 'white' }}
                  selected={sidebarItem.path === pathname}
                  button
                >
                  <ListItemIcon>{sidebarItem.icon}</ListItemIcon>
                  <ListItemText primary={t(sidebarItem.name)} />
                </ListItem>
              </Link>
            )
          })}
        {/* {Add the below to SidebarItems.tsx file when you need to enable them} */}
        {/* <Link to="/admin/sessions" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <DragIndicator style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.sessions')} />
          </ListItem>
        </Link> */}
        {/* <Link to="/admin/chats" className={classes.textLink}>
          <ListItem style={{ color: 'white' }} button>
            <ListItemIcon>
              <Forum style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={t('user:dashboard.chats')} />
          </ListItem>
        </Link> */}
      </List>
      <Divider style={{ background: '#C0C0C0', marginTop: '2rem' }} />
      {SocialSidebarItems().map((item, index) => {
        return (
          <List key={index}>
            <ListSubheader inset style={{ color: '#C0C0C0' }}>
              {item.title}
            </ListSubheader>
            <List>
              {item.items.map((socialItem, key) => {
                return (
                  <Link key={key} style={{ textDecoration: 'none' }} to={socialItem.path}>
                    <ListItem
                      style={{ color: 'white' }}
                      classes={{ selected: classes.selected }}
                      selected={socialItem.path === pathname}
                      button
                    >
                      <ListItemIcon>{socialItem.icon}</ListItemIcon>
                      <ListItemText primary={t(socialItem.name)} />
                    </ListItem>
                  </Link>
                )
              })}
            </List>
          </List>
        )
      })}
    </>
  )
}

export default withRouter(DashboardMenuItem)
