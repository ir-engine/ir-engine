import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import LoadingView from '@xrengine/client-core/src/common/components/LoadingView'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { AvatarRigComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getOptionalComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getState, useHookstate } from '@xrengine/hyperflux'

import {
  ArrowBack,
  Check,
  Close,
  Help,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Mouse,
  PersonAdd
} from '@mui/icons-material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../../services/AuthService'
import { AVATAR_PAGE_LIMIT, AvatarService, AvatarState } from '../../../services/AvatarService'
import { loadAvatarForPreview, resetAnimationLogic } from '../../Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '../../Panel3D/useRender3DPanelSystem'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

const SelectAvatarMenu = (props: Props) => {
  const { t } = useTranslation()
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const authState = useAuthState()
  const avatarId = authState.user?.avatarId?.value
  const avatarState = useHookstate(getState(AvatarState))
  const avatarList = avatarState.avatarList.value

  const [page, setPage] = useState(0)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarInterface | null>()
  const [avatarLoading, setAvatarLoading] = useState(false)

  const renderPanel = useRender3DPanelSystem(panelRef)
  const { entity, camera, scene, renderer } = renderPanel.state

  useEffect(() => {
    loadAvatarPreview()
  }, [selectedAvatar])

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  const loadAvatarPreview = async () => {
    const oldAvatar = scene.value.children.find((item) => item.name === 'avatar')
    if (oldAvatar) {
      scene.value.remove(oldAvatar)
    }

    if (!selectedAvatar || !selectedAvatar.modelResource) return

    setAvatarLoading(true)
    resetAnimationLogic(entity.value)
    const avatar = await loadAvatarForPreview(entity.value, selectedAvatar.modelResource.url)
    const avatarRigComponent = getOptionalComponent(entity.value, AvatarRigComponent)
    if (avatarRigComponent) {
      avatarRigComponent.rig.Neck.getWorldPosition(camera.value.position)
      camera.value.position.y += 0.2
      camera.value.position.z = 0.6
    }
    setAvatarLoading(false)
    if (avatar) {
      avatar.name = 'avatar'
      scene.value.add(avatar)
    }
  }

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(Engine.instance.currentWorld.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

  const loadNextAvatars = (e) => {
    e.preventDefault()

    setPage(page + 1)
    AvatarService.fetchAvatarList('increment')
  }

  const loadPreviousAvatars = (e) => {
    e.preventDefault()

    setPage(page - 1)
    AvatarService.fetchAvatarList('decrement')
  }

  const confirmAvatar = () => {
    if (selectedAvatar && avatarId != selectedAvatar?.name) {
      setAvatar(
        selectedAvatar?.id || '',
        selectedAvatar?.modelResource?.url || '',
        selectedAvatar?.thumbnailResource?.url || ''
      )
      props.changeActiveMenu(Views.Closed)
    }
    setSelectedAvatar(null)
  }

  const selectAvatar = (avatarResources: AvatarInterface) => {
    setSelectedAvatar(avatarResources)
  }

  const openAvatarSelectMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.AvatarUpload)
  }

  const openProfileMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.Profile)
  }

  return (
    <div className={`${styles.menuPanel} ${styles.avatarSelectPanel}`}>
      <div className={styles.titleBlock}>
        <button type="button" className={styles.iconBlock} onClick={openProfileMenu}>
          <ArrowBack />
        </button>
        <h2>{t('user:avatar.titleSelectAvatar')}</h2>
      </div>

      <Grid sx={{ height: '100%' }} spacing={2} container className={styles.contentContainer}>
        <Grid item md={3} className={styles.buttonsContainer}>
          <Button
            className={styles.gradientBtn}
            startIcon={<PersonAdd />}
            title={t('user:avatar.upload')}
            onClick={openAvatarSelectMenu}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            {t('user:avatar.upload')}
          </Button>

          <Button
            className={`${styles.gradientBtn} ${styles.cancelBtn}`}
            startIcon={<Close />}
            title={t('user:avatar.cancel')}
            disabled={!selectedAvatar}
            onClick={() => {
              setSelectedAvatar(null)
            }}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            {t('user:avatar.cancel')}
          </Button>

          <Button
            className={styles.gradientBtn}
            startIcon={<Check />}
            title={t('user:avatar.confirm')}
            disabled={!selectedAvatar}
            onClick={confirmAvatar}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            {t('user:avatar.confirm')}
          </Button>
        </Grid>
        <Grid item md={6} className={styles.previewContainer}>
          <Box className={styles.preview}>
            <div ref={panelRef} id="stage" style={{ width: '100%', aspectRatio: 1 }} />

            {avatarLoading && (
              <LoadingView
                title={t('admin:components.avatar.loading')}
                variant="body2"
                sx={{ position: 'absolute', top: 0 }}
              />
            )}

            {!selectedAvatar && (
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
                    <Mouse fontSize="small" />
                  </Typography>

                  <br />

                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {t('user:avatar.pan')}:
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                    {t('admin:components.avatar.rightClick')} <Mouse fontSize="small" />
                  </Typography>

                  <br />

                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {t('admin:components.avatar.zoom')}:
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                    {t('admin:components.avatar.scroll')} <Mouse fontSize="small" />
                  </Typography>
                </Box>
              }
            >
              <Help sx={{ position: 'absolute', top: 0, right: 0, margin: 1 }} />
            </Tooltip>
          </Box>
        </Grid>
        <Grid item md={3} className={styles.avatarContainer}>
          <button
            type="button"
            style={{ visibility: 'hidden' }}
            className={`${styles.btn} ${styles.btnArrow} ${styles.disabled}`}
          >
            <KeyboardArrowUp className={styles.size} onClick={loadPreviousAvatars} />
          </button>
          <Grid container spacing={1} className={styles.avatarList}>
            {avatarList.map((avatar) => (
              <Grid key={avatar.id} md={12} item>
                <Paper
                  title={avatar.name}
                  onClick={() => selectAvatar(avatar)}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  style={{ pointerEvents: avatar.name == avatarId ? 'none' : 'auto' }}
                  className={`${styles.paperAvatar} ${avatar.name == selectedAvatar?.name ? styles.selectedAvatar : ''}
              ${avatar.name == avatarId ? styles.activeAvatar : ''}`}
                  sx={{
                    boxShadow: 'none',
                    backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1A2027' : '#f1f1f1')
                  }}
                >
                  <img
                    className={styles.avatar}
                    src={avatar.thumbnailResource?.url || ''}
                    alt={avatar.name}
                    crossOrigin="anonymous"
                  />
                  <Typography variant="body2" className={styles.avatarName}>
                    {avatar.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <button
            type="button"
            style={{ visibility: 'hidden' }}
            className={`${styles.btn} ${styles.btnArrow} ${
              (page + 1) * AVATAR_PAGE_LIMIT >= avatarState.total.value ? styles.disabled : ''
            }`}
            onClick={loadNextAvatars}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <KeyboardArrowDown className={styles.size} />
          </button>
        </Grid>
      </Grid>
    </div>
  )
}

export default SelectAvatarMenu
