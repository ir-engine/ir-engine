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

import LocationDrawer, {
  LocationDrawerMode
} from '@etherealengine/client-core/src/admin/components/Location/LocationDrawer'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { SceneID, locationPath } from '@etherealengine/common/src/schema.type.module'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

export const PublishLocation = () => {
  const { t } = useTranslation()
  const openLocationDrawer = useHookstate(false)
  const activeScene = useHookstate(getMutableState(SceneState).activeScene)
  const selectedScene = activeScene.value
    ? (activeScene.value!.replace('.scene.json', '').replace(`${activeScene.value!.split('/', 1)[0]}/`, '') as SceneID)
    : null

  const drawerMode = useHookstate<LocationDrawerMode>(LocationDrawerMode.Create)
  const user = useHookstate(getMutableState(AuthState).user)
  const hasWriteAccess = user.scopes.get(NO_PROXY)?.find((item) => item?.type === 'location:write')

  const existingLocation = useFind(locationPath, {
    query: {
      $sort: { name: 1 },
      $limit: 1,
      action: 'studio',
      sceneId: {
        $like: `%${activeScene.value}%` as SceneID
      }
    }
  })

  const handleCloseLocationDrawer = () => {
    openLocationDrawer.set(false)
    drawerMode.set(LocationDrawerMode.Create)
  }

  const handleOpenLocationDrawer = async () => {
    existingLocation.refetch()
    if (existingLocation.data.length > 0) drawerMode.set(LocationDrawerMode.ViewEdit)

    openLocationDrawer.set(true)
  }

  return (
    <>
      <div
        id="publish-location"
        className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer + ' ' + styles.publishButton}
      >
        <InfoTooltip title={t('editor:toolbar.publishLocation.lbl')} info={t('editor:toolbar.publishLocation.info')}>
          <Button
            onClick={handleOpenLocationDrawer}
            className={styles.toolButton}
            disabled={!activeScene.value || !hasWriteAccess}
          >
            {t(`editor:toolbar.publishLocation.title`)}
          </Button>
        </InfoTooltip>
      </div>
      <LocationDrawer
        open={openLocationDrawer.value}
        mode={drawerMode.value}
        selectedLocation={existingLocation.data[0]}
        selectedScene={selectedScene}
        onClose={handleCloseLocationDrawer}
      />
    </>
  )
}

export default PublishLocation
