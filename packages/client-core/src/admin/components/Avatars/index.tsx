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

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { AnimationSystem } from '@etherealengine/engine/src/avatar/systems/AnimationSystem'
import { AvatarAnimationSystem } from '@etherealengine/engine/src/avatar/systems/AvatarAnimationSystem'
import { DebugRendererSystem } from '@etherealengine/engine/src/debug/systems/DebugRendererSystem'
import { AnimationSystemGroup, PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { useSystem, useSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { WebGLRendererSystem } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { SceneSystemLoadGroup, SceneSystemUpdateGroup } from '@etherealengine/engine/src/scene/SceneClientModule'
import { SceneObjectSystem } from '@etherealengine/engine/src/scene/systems/SceneObjectSystem'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import Search from '../../common/Search'
import { AdminAvatarService } from '../../services/AvatarService'
import styles from '../../styles/admin.module.scss'
import AvatarDrawer, { AvatarDrawerMode } from './AvatarDrawer'
import AvatarTable from './AvatarTable'

const Avatar = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [openAvatarDrawer, setOpenAvatarDrawer] = useState(false)
  const [openDeleteAvatarModal, setOpenDeleteAvatarModal] = React.useState(false)
  const [selectedAvatarIds, setSelectedAvatarIds] = useState(() => new Set<string>())

  /** Avatar / Animation */
  useSystems([AnimationSystem, AvatarAnimationSystem], {
    with: AnimationSystemGroup
  })

  /** Post Transform / Pre Render */
  useSystems([SceneObjectSystem, DebugRendererSystem, SceneSystemUpdateGroup], {
    before: PresentationSystemGroup
  })

  /** Render */
  useSystem(WebGLRendererSystem, {
    with: PresentationSystemGroup
  })

  useSystem(SceneSystemLoadGroup, {
    after: PresentationSystemGroup
  })

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  const handleDeleteAll = () => {
    for (let id of selectedAvatarIds) AdminAvatarService.removeAdminAvatar(id)
    setOpenDeleteAvatarModal(false)
  }

  return (
    <React.Fragment>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={12} sm={8}>
          <Search text="avatar" handleChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex' }}>
            <Button
              className={styles.openModalBtn}
              type="submit"
              variant="contained"
              onClick={() => setOpenAvatarDrawer(true)}
            >
              {t('user:avatar.createAvatar')}
            </Button>

            {selectedAvatarIds.size > 0 && (
              <IconButton
                className={styles.filterButton}
                sx={{ ml: 1 }}
                size="small"
                title={t('admin:components.avatar.deleteSelected')}
                onClick={() => setOpenDeleteAvatarModal(true)}
                icon={<Icon type="Delete" color="info" fontSize="large" />}
              />
            )}
          </Box>
        </Grid>
      </Grid>
      <AvatarTable
        className={styles.rootTableWithSearch}
        search={search}
        selectedAvatarIds={selectedAvatarIds}
        setSelectedAvatarIds={setSelectedAvatarIds}
      />

      {openAvatarDrawer && (
        <AvatarDrawer open mode={AvatarDrawerMode.Create} onClose={() => setOpenAvatarDrawer(false)} />
      )}

      <ConfirmDialog
        open={openDeleteAvatarModal}
        description={t('admin:components.avatar.confirmMultiDelete')}
        onSubmit={handleDeleteAll}
        onClose={() => setOpenDeleteAvatarModal(false)}
      />
    </React.Fragment>
  )
}

export default Avatar
