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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { SidebarItems } from '@etherealengine/ui/src/primitives/mui/DashboardItems'
import Divider from '@etherealengine/ui/src/primitives/mui/Divider'
import List from '@etherealengine/ui/src/primitives/mui/List'
import ListItem from '@etherealengine/ui/src/primitives/mui/ListItem'
import ListItemIcon from '@etherealengine/ui/src/primitives/mui/ListItemIcon'
import ListItemText from '@etherealengine/ui/src/primitives/mui/ListItemText'

import styles from './index.module.scss'

const DashboardMenuItem = () => {
  const location = useLocation()
  const { pathname } = location

  const authState = useHookstate(getMutableState(AuthState))
  const { user } = authState
  const { scopes } = user

  const { t } = useTranslation()

  const [allowedRoutes, setAllowedRoutes] = useState({
    analytics: true,
    location: false,
    user: false,
    bot: false,
    scene: false,
    channel: false,
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
      setAllowedRoutes({
        ...allowedRoutes,
        ...value?.reduce((prevoius, current) => Object.assign({}, prevoius, { [current.type.split(':')[0]]: true }))
      })
    }
  }, [scopes])

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
