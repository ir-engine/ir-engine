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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'

import { useServerInfoFind } from '../../services/ServerInfoQuery'
import styles from '../../styles/admin.module.scss'
import ServerTable from './ServerTable'

import 'react-reflex/styles.css'

import ServerItemCard from './ServerItemCard'
import ServerLogs, { ServerLogsInputsType } from './ServerLogs'

const Server = () => {
  const { t } = useTranslation()

  const selectedCard = useHookstate('all')
  const serverLogsInputs = useHookstate({ podName: undefined, containerName: undefined } as ServerLogsInputsType)

  const serverInfo = useServerInfoFind().data

  if (!serverInfo) {
    return (
      <LoadingView title={t('admin:components.server.loading')} variant="body2" sx={{ position: 'absolute', top: 0 }} />
    )
  }

  return (
    <Box sx={{ height: 'calc(100% - 106px)' }}>
      <Grid container spacing={1} className={styles.mb10px}>
        {serverInfo.map((item, index) => (
          <Grid item key={item.id} xs={12} sm={6} md={2}>
            <ServerItemCard
              key={index}
              id={item.id}
              title={item.label}
              description={`${item.pods.filter((item) => item.status === 'Running').length}/${item.pods.length}`}
              isSelected={selectedCard.value === item.id}
              onCardClick={selectedCard.set}
            />
          </Grid>
        ))}
      </Grid>
      {!serverLogsInputs.podName.value && (
        <ServerTable selectedCard={selectedCard.value} setServerLogsInputs={serverLogsInputs.set} />
      )}
      {serverLogsInputs.podName.value && (
        <ReflexContainer orientation="horizontal">
          <ReflexElement flex={0.45} style={{ display: 'flex', flexDirection: 'column' }}>
            <ServerTable selectedCard={selectedCard.value} setServerLogsInputs={serverLogsInputs.set} />
          </ReflexElement>

          <ReflexSplitter />

          <ReflexElement flex={0.55} style={{ overflow: 'hidden' }}>
            <ServerLogs podName={serverLogsInputs.podName} containerName={serverLogsInputs.containerName} />
          </ReflexElement>
        </ReflexContainer>
      )}
    </Box>
  )
}

export default Server
