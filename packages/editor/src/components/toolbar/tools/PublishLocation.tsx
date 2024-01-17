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
import { SceneID, locationPath } from '@etherealengine/common/src/schema.type.module'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

export const PublishLocation = () => {
  const { t } = useTranslation()
  const openLocationDrawer = useHookstate(false)
  let activeScene = useHookstate(getMutableState(SceneState).activeScene).value
  let drawerMode = LocationDrawerMode.Create

  const existingLocation = useFind(locationPath, {
    query: {
      $sort: { name: 1 },
      $limit: 1,
      action: 'studio',
      sceneId: {
        $like: `%${activeScene}%` as SceneID
      }
    }
  })

  const handleOpenLocationDrawer = async () => {
    if (existingLocation.data.length > 0) {
      drawerMode = LocationDrawerMode.ViewEdit
    }
    activeScene = activeScene!.replace('.scene.json', '').replace('projects/', '') as SceneID
    openLocationDrawer.set(true)
  }

  return (
    <>
      <div id="publish-location" className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer}>
        <InfoTooltip title={t('editor:toolbar.publishLocation.lbl')} info={t('editor:toolbar.publishLocation.info')}>
          <Button onClick={handleOpenLocationDrawer} disabled={!activeScene} className={styles.btn}>
            {t(`editor:toolbar.publishLocation.title`)}
          </Button>
        </InfoTooltip>
      </div>
      <LocationDrawer
        open={openLocationDrawer.value}
        mode={drawerMode}
        selectedScene={activeScene}
        onClose={() => openLocationDrawer.set(false)}
      />
    </>
  )
}

export default PublishLocation
