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

import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import Tabs from '@etherealengine/ui/src/primitives/tailwind/Tabs'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ProjectTab from './tabs/project'

import AuthenticationTab from './tabs/authentication'
import ClientTab from './tabs/client'
import EmailTab from './tabs/email'
import HelmTab from './tabs/helm'
import PluginsTab from './tabs/plugins'

import InstanceServerTab from './tabs/instanceServer'
import ServerTab from './tabs/server'
import TaskServerTab from './tabs/taskServer'

export default function Settings() {
  const { t } = useTranslation()

  const refs = useHookstate([] as React.RefObject<HTMLDivElement>[])

  const tabsData = useHookstate(
    [] as {
      title: string
      tabLabel: string
      bottomComponent: JSX.Element
      ref: React.RefObject<HTMLDivElement>
    }[]
  )

  useEffect(() => {
    refs.set([
      React.createRef(),
      React.createRef(),
      React.createRef(),
      React.createRef(),
      React.createRef(),
      React.createRef(),
      React.createRef(),
      React.createRef(),
      React.createRef()
    ])
    tabsData.set([
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.project'),
        bottomComponent: <ProjectTab ref={refs[0].get(NO_PROXY)} />,
        ref: refs[0].get(NO_PROXY)
      },
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.server'),
        bottomComponent: <ServerTab ref={refs[1].get(NO_PROXY)} />,
        ref: refs[1].get(NO_PROXY)
      },
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.helm.header'),
        bottomComponent: <HelmTab ref={refs[2].get(NO_PROXY)} />,
        ref: refs[2].get(NO_PROXY)
      },
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.client'),
        bottomComponent: <ClientTab ref={refs[3].get(NO_PROXY)} />,
        ref: refs[3].get(NO_PROXY)
      },
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.instanceServer'),
        bottomComponent: <InstanceServerTab ref={refs[4].get(NO_PROXY)} />,
        ref: refs[4].get(NO_PROXY)
      },
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.taskServer.taskServer'),
        bottomComponent: <TaskServerTab ref={refs[5].get(NO_PROXY)} />,
        ref: refs[5].get(NO_PROXY)
      },
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.email'),
        bottomComponent: <EmailTab ref={refs[6].get(NO_PROXY)} />,
        ref: refs[6].get(NO_PROXY)
      },
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.authentication'),
        bottomComponent: <AuthenticationTab ref={refs[7].get(NO_PROXY)} />,
        ref: refs[7].get(NO_PROXY)
      },
      {
        title: t('admin:components.setting.settings'),
        tabLabel: t('admin:components.setting.plugins'),
        bottomComponent: <PluginsTab ref={refs[8].get(NO_PROXY)} />,
        ref: refs[8].get(NO_PROXY)
      }
    ])
  }, [])

  return <Tabs scrollable tabsData={tabsData.get(NO_PROXY)} />
}
