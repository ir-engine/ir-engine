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

import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import InputFile from '@etherealengine/client-core/src/common/components/InputFile'
import InputRadio from '@etherealengine/client-core/src/common/components/InputRadio'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import { getCanvasBlob, isValidHttpUrl } from '@etherealengine/client-core/src/common/utils'
import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MAX_THUMBNAIL_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  MIN_THUMBNAIL_FILE_SIZE,
  THUMBNAIL_FILE_ALLOWED_EXTENSIONS,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@etherealengine/common/src/constants/AvatarConstants'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { getOptionalComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import FormControl from '@etherealengine/ui/src/primitives/mui/FormControl'
import FormHelperText from '@etherealengine/ui/src/primitives/mui/FormHelperText'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Tooltip from '@etherealengine/ui/src/primitives/mui/Tooltip'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { loadAvatarForPreview, resetAnimationLogic } from '../../../user/components/Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '../../../user/components/Panel3D/useRender3DPanelSystem'
import { AuthState } from '../../../user/services/AuthService'
import { AvatarService } from '../../../user/services/AvatarService'
import DrawerView from '../../common/DrawerView'
import { AdminAvatarState } from '../../services/AvatarService'
import styles from '../../styles/admin.module.scss'

export enum AvatarDrawerMode {
  Create,
  ViewEdit
}

enum ConfirmState {
  None,
  File,
  Url
}

interface Props {
  open: boolean
  mode: AvatarDrawerMode
  selectedAvatar?: AvatarType
  onClose: () => void
}

const defaultState = {
  name: '',
  source: 'file',
  avatarUrl: '',
  thumbnailUrl: '',
  avatarFile: undefined as File | undefined,
  thumbnailFile: undefined as File | undefined,
  formErrors: {
    name: '',
    avatarUrl: '',
    thumbnailUrl: '',
    avatarFile: '',
    thumbnailFile: ''
  }
}

const AvatarDrawerContent = ({ open, mode, selectedAvatar, onClose }: Props) => {
  const { t } = useTranslation()
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const editMode = useHookstate(false)
  const state = useHookstate({ ...defaultState })
  const avatarLoading = useHookstate(false)
  const showConfirm = useHookstate(ConfirmState.None)

  const renderPanel = useRender3DPanelSystem(panelRef)
  const { entity, camera, scene, renderer } = renderPanel.state

  const user = useHookstate(getMutableState(AuthState).user).value
  const thumbnail = useHookstate(getMutableState(AdminAvatarState).thumbnail).value

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'static_resource:write')
  const viewMode = mode === AvatarDrawerMode.ViewEdit && !editMode

  let thumbnailSrc = ''
  if (state.source.value === 'file' && state.thumbnailFile.value) {
    thumbnailSrc = URL.createObjectURL(state.thumbnailFile.value)
  } else if (state.source.value === 'url' && state.thumbnailUrl.value) {
    thumbnailSrc = state.thumbnailUrl.value
  }

  useEffect(() => {
    const initSelected = async () => {
      if (selectedAvatar?.id) {
        loadSelectedAvatar()
      }
    }

    initSelected()
  }, [selectedAvatar, thumbnail?.url])

  useEffect(() => {
    updateAvatar()
  }, [state.source, state.avatarFile, state.avatarUrl])

  const loadSelectedAvatar = () => {
    if (selectedAvatar) {
      state.set({
        ...defaultState,
        name: selectedAvatar.name || '',
        source: 'url',
        avatarUrl: selectedAvatar.modelResource?.url || '',
        thumbnailUrl: selectedAvatar.thumbnailResource?.url || '',
        avatarFile: undefined,
        thumbnailFile: undefined
      })
    }
  }

  const updateAvatar = async () => {
    let url = ''
    if (state.source.value === 'url' && state.avatarUrl.value) {
      const validEndsWith = AVATAR_FILE_ALLOWED_EXTENSIONS.split(',').some((suffix) => {
        return state.avatarUrl.value.endsWith(suffix)
      })
      url = isValidHttpUrl(state.avatarUrl.value) && validEndsWith ? state.avatarUrl.value : ''
    } else if (state.source.value === 'file' && state.avatarFile.value) {
      await state.avatarFile.value.arrayBuffer()

      const assetType = AssetLoader.getAssetType(state.avatarFile.value.name)
      if (assetType) {
        url = URL.createObjectURL(state.avatarFile.value) + '#' + state.avatarFile.value.name
      }
    }

    if (url) {
      avatarLoading.set(true)
      resetAnimationLogic(entity.value)
      const avatar = await loadAvatarForPreview(entity.value, url)
      const avatarRigComponent = getOptionalComponent(entity.value, AvatarRigComponent)
      if (avatarRigComponent) {
        avatarRigComponent.rig.Neck.getWorldPosition(camera.value.position)
        camera.value.position.y += 0.2
        camera.value.position.z = 0.6
      }
      avatarLoading.set(false)
      if (avatar) {
        avatar.name = 'avatar'
        scene.value.add(avatar)
      }
    }
  }

  const handleCancel = () => {
    if (editMode.value) {
      loadSelectedAvatar()
      editMode.set(false)
    } else onClose()
  }

  const handleChangeFile = (e) => {
    const { name, files } = e.target

    if (files.length === 0) {
      return
    }

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'avatarFile': {
        const inValidSize = files[0].size < MIN_AVATAR_FILE_SIZE || files[0].size > MAX_AVATAR_FILE_SIZE
        state.formErrors.merge({
          avatarFile: inValidSize
            ? t('admin:components.avatar.avatarFileOversized', {
                minSize: MIN_AVATAR_FILE_SIZE / 1048576,
                maxSize: MAX_AVATAR_FILE_SIZE / 1048576
              })
            : ''
        })
        break
      }
      case 'thumbnailFile': {
        const inValidSize = files[0].size < MIN_THUMBNAIL_FILE_SIZE || files[0].size > MAX_THUMBNAIL_FILE_SIZE
        state.formErrors.merge({
          thumbnailFile: inValidSize
            ? t('admin:components.avatar.thumbnailFileOversized', {
                minSize: MIN_THUMBNAIL_FILE_SIZE / 1048576,
                maxSize: MAX_THUMBNAIL_FILE_SIZE / 1048576
              })
            : ''
        })
        break
      }
      default:
        break
    }

    state.merge({ [name]: files[0] })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'name':
        state.formErrors.merge({ name: value.length < 2 ? t('admin:components.avatar.nameRequired') : '' })
        break
      case 'avatarUrl': {
        const validEndsWith = AVATAR_FILE_ALLOWED_EXTENSIONS.split(',').some((suffix) => {
          return value.endsWith(suffix)
        })
        state.formErrors.merge({
          avatarUrl: !(isValidHttpUrl(value) && validEndsWith) ? t('admin:components.avatar.avatarUrlInvalid') : ''
        })
        break
      }
      case 'thumbnailUrl': {
        const validEndsWith = THUMBNAIL_FILE_ALLOWED_EXTENSIONS.split(',').some((suffix) => {
          return value.endsWith(suffix)
        })
        state.formErrors.merge({
          thumbnailUrl: !(isValidHttpUrl(value) && validEndsWith)
            ? t('admin:components.avatar.thumbnailUrlInvalid')
            : ''
        })
        break
      }
      default:
        break
    }

    state.merge({ [name]: value })
  }

  const handleSubmit = async () => {
    let avatarFile: File | undefined = undefined
    let thumbnailFile: File | undefined = undefined

    let tempErrors = {
      name: state.name.value ? '' : t('admin:components.avatar.nameCantEmpty'),
      avatarUrl:
        state.source.value === 'url' && state.avatarUrl.value ? '' : t('admin:components.avatar.avatarUrlCantEmpty'),
      thumbnailUrl:
        state.source.value === 'url' && state.thumbnailUrl.value
          ? ''
          : t('admin:components.avatar.thumbnailUrlCantEmpty'),
      avatarFile:
        state.source.value === 'file' && state.avatarFile.value ? '' : t('admin:components.avatar.avatarFileCantEmpty'),
      thumbnailFile:
        state.source.value === 'file' && state.thumbnailFile.value
          ? ''
          : t('admin:components.avatar.thumbnailFileCantEmpty')
    }

    state.formErrors.merge(tempErrors)

    if (
      (state.source.value === 'file' && (tempErrors.avatarFile || tempErrors.thumbnailFile)) ||
      (state.source.value === 'url' && (tempErrors.avatarUrl || tempErrors.thumbnailUrl))
    ) {
      NotificationService.dispatchNotify(t('admin:components.common.fixErrorFields'), { variant: 'error' })
      return
    } else if (tempErrors.name) {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
      return
    } else if (state.source.value === 'file' && state.avatarFile.value && state.thumbnailFile.value) {
      avatarFile = state.avatarFile.value
      thumbnailFile = state.thumbnailFile.value
    } else if (state.source.value === 'url' && state.avatarUrl.value && state.thumbnailUrl.value) {
      const avatarData = await fetch(state.avatarUrl.value)
      avatarFile = new File([await avatarData.blob()], state.name.value)

      const thumbnailData = await fetch(state.thumbnailUrl.value)
      thumbnailFile = new File([await thumbnailData.blob()], state.name.value)
    }

    if (avatarFile && thumbnailFile) {
      if (selectedAvatar?.id) {
        await AvatarService.patchAvatar(selectedAvatar, state.name.value, true, avatarFile, thumbnailFile)
      } else await AvatarService.createAvatar(avatarFile, thumbnailFile, state.name.value, true)
      getMutableState(AdminAvatarState).merge({ updateNeeded: true })

      onClose()
    }
  }

  const handleGenerateFileThumbnail = () => {
    if (state.thumbnailFile.value) {
      showConfirm.set(ConfirmState.File)
      return
    }

    handleGenerateThumbnail(true)
  }

  const handleGenerateUrlThumbnail = () => {
    if (state.thumbnailUrl.value) {
      showConfirm.set(ConfirmState.Url)
      return
    }

    handleGenerateThumbnail(false)
  }

  const handleGenerateThumbnail = async (isFile: boolean) => {
    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(renderer.value.domElement, 0, 0)

    const blob = await getCanvasBlob(canvas)
    if (isFile) {
      state.merge({ thumbnailFile: new File([blob!], 'thumbnail.png') })
    } else {
      state.merge({ thumbnailUrl: URL.createObjectURL(blob!) })
    }

    showConfirm.set(ConfirmState.None)
  }

  return (
    <Container maxWidth="sm" className={styles.mt10}>
      <DialogTitle className={styles.textAlign}>
        {mode === AvatarDrawerMode.Create && t('user:avatar.createAvatar')}
        {mode === AvatarDrawerMode.ViewEdit &&
          editMode.value &&
          `${t('admin:components.common.update')} ${selectedAvatar?.name}`}
        {mode === AvatarDrawerMode.ViewEdit && !editMode.value && selectedAvatar?.name}
      </DialogTitle>

      <InputText
        name="name"
        label={t('admin:components.user.name')}
        value={state.name.value}
        error={state.formErrors.name.value}
        disabled={viewMode}
        onChange={handleChange}
      />

      {!viewMode && (
        <InputRadio
          name="source"
          label={t('admin:components.avatar.source')}
          value={state.source.value}
          options={[
            { value: 'file', label: t('admin:components.avatar.file') },
            { value: 'url', label: t('admin:components.avatar.url') }
          ]}
          onChange={handleChange}
        />
      )}

      {state.source.value === 'file' && (
        <>
          <label htmlFor="select-avatar">
            <InputFile
              id="select-avatar"
              name="avatarFile"
              accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
              onChange={handleChangeFile}
            />
            <Button className={styles.gradientButton} component="span" startIcon={<Icon type="Face" />}>
              {t('admin:components.avatar.selectAvatar')}
            </Button>
          </label>

          {state.formErrors.avatarFile.value && (
            <Box>
              <FormControl error>
                <FormHelperText className="Mui-error">{state.formErrors.avatarFile.value}</FormHelperText>
              </FormControl>
            </Box>
          )}
        </>
      )}

      {state.source.value === 'url' && (
        <InputText
          name="avatarUrl"
          sx={{ mt: 3, mb: 1 }}
          label={t('admin:components.avatar.avatarUrl')}
          value={state.avatarUrl.value}
          error={state.formErrors.avatarUrl.value}
          disabled={viewMode}
          onChange={handleChange}
        />
      )}

      <Box
        className={styles.preview}
        style={{ width: THUMBNAIL_WIDTH + 'px', height: THUMBNAIL_HEIGHT + 'px', position: 'relative' }}
      >
        <div ref={panelRef} id="stage" style={{ width: THUMBNAIL_WIDTH + 'px', height: THUMBNAIL_HEIGHT + 'px' }} />

        {avatarLoading.value && (
          <LoadingView
            title={t('admin:components.avatar.loading')}
            variant="body2"
            sx={{ position: 'absolute', top: 0 }}
          />
        )}

        {((state.source.value === 'file' && !state.avatarFile.value) ||
          (state.source.value === 'url' && !state.avatarUrl.value)) && (
          <Typography
            sx={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
              fontSize: 14,
              top: 0
            }}
          >
            {t('admin:components.avatar.avatarPreview')}
          </Typography>
        )}

        <Tooltip
          arrow
          title={
            <Box sx={{ width: 100 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t('user:avatar.rotate')}:
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.leftClick')}
                <Icon type="Mouse" fontSize="small" />
              </Typography>

              <br />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t('user:avatar.pan')}:
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.rightClick')} <Icon type="Mouse" fontSize="small" />
              </Typography>

              <br />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t('admin:components.avatar.zoom')}:
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.scroll')} <Icon type="Mouse" fontSize="small" />
              </Typography>
            </Box>
          }
        >
          <Icon type="Help" sx={{ position: 'absolute', top: 0, right: 0, margin: 1 }} />
        </Tooltip>
      </Box>

      {state.source.value === 'file' && (
        <>
          <label htmlFor="select-thumbnail">
            <InputFile
              id="select-thumbnail"
              name="thumbnailFile"
              accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
              onChange={handleChangeFile}
            />
            <Button className={styles.gradientButton} component="span" startIcon={<Icon type="AccountCircle" />}>
              {t('admin:components.avatar.selectThumbnail')}
            </Button>
          </label>

          <Button
            className={styles.gradientButton}
            startIcon={<Icon type="Portrait" />}
            sx={{ marginLeft: 1, width: '250px' }}
            title={t('admin:components.avatar.saveThumbnailTooltip')}
            disabled={!state.avatarFile.value || avatarLoading.value}
            onClick={handleGenerateFileThumbnail}
          >
            {t('admin:components.avatar.saveThumbnail')}
          </Button>

          {state.formErrors.thumbnailFile.value && (
            <Box>
              <FormControl error>
                <FormHelperText className="Mui-error">{state.formErrors.thumbnailFile.value}</FormHelperText>
              </FormControl>
            </Box>
          )}
        </>
      )}

      {state.source.value === 'url' && (
        <Box sx={{ display: 'flex', alignItems: 'self-end' }}>
          <InputText
            name="thumbnailUrl"
            sx={{ mt: 2, mb: 1, flex: 1 }}
            label={t('admin:components.avatar.thumbnailUrl')}
            value={state.thumbnailUrl.value}
            error={state.formErrors.thumbnailUrl.value}
            disabled={viewMode}
            onChange={handleChange}
          />

          {editMode.value && (
            <Button
              className={styles.gradientButton}
              startIcon={<Icon type="Portrait" />}
              sx={{ marginLeft: 1, width: '250px' }}
              title={t('admin:components.avatar.saveThumbnailTooltip')}
              disabled={viewMode || !state.avatarUrl.value || avatarLoading.value}
              onClick={handleGenerateUrlThumbnail}
            >
              {t('admin:components.avatar.saveThumbnail')}
            </Button>
          )}
        </Box>
      )}

      {editMode.value && (
        <Box
          className={styles.preview}
          style={{ width: '100px', height: '100px', position: 'relative', marginBottom: 15 }}
        >
          <img src={thumbnailSrc} crossOrigin="anonymous" />
          {((state.source.value === 'file' && !state.thumbnailFile.value) ||
            (state.source.value === 'url' && !state.thumbnailUrl.value)) && (
            <Typography
              sx={{
                position: 'absolute',
                top: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                fontSize: 14
              }}
            >
              {t('admin:components.avatar.thumbnailPreview')}
            </Typography>
          )}
        </Box>
      )}

      <DialogActions>
        <Button className={styles.outlinedButton} onClick={handleCancel}>
          {t('admin:components.common.cancel')}
        </Button>
        {(mode === AvatarDrawerMode.Create || editMode.value) && (
          <Button className={styles.gradientButton} onClick={handleSubmit}>
            {t('admin:components.common.submit')}
          </Button>
        )}
        {mode === AvatarDrawerMode.ViewEdit && !editMode.value && (
          <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => editMode.set(true)}>
            {t('admin:components.common.edit')}
          </Button>
        )}
      </DialogActions>

      {showConfirm.value !== ConfirmState.None && (
        <ConfirmDialog
          open
          description={t('admin:components.avatar.confirmThumbnailReplace')}
          onClose={() => showConfirm.set(ConfirmState.None)}
          onSubmit={() => handleGenerateThumbnail(showConfirm.value === ConfirmState.File)}
        />
      )}
    </Container>
  )
}

const AvatarDrawer = (props: Props) => {
  const { open, onClose } = props
  return (
    <DrawerView open={open} onClose={onClose}>
      <AvatarDrawerContent {...props} />
    </DrawerView>
  )
}

export default AvatarDrawer
