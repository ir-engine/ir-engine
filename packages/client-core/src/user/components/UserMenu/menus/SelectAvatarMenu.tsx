import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { AvatarRigComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { loadAvatarForPreview } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
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

import LoadingView from '../../../../admin/common/LoadingView'
import { useAuthState } from '../../../services/AuthService'
import { AvatarService, AvatarState } from '../../../services/AvatarService'
import { resetAnimationLogic } from '../../Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '../../Panel3D/useRender3DPanelSystem'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

const SelectAvatarMenu = (props: Props) => {
  const { t } = useTranslation()
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>

  const MAX_AVATARS_PER_PAGE = window.innerWidth <= 1024 ? 9 : 12
  const MIN_AVATARS_PER_PAGE = 6
  const getAvatarPerPage = () => (window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE)
  const authState = useAuthState()
  const avatarId = authState.user?.avatarId?.value
  const avatarState = useHookstate(getState(AvatarState))
  const avatarList = avatarState.avatarList.value

  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(Math.min(getAvatarPerPage(), avatarState.limit.value))
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

  useEffect(() => {
    if (page * imgPerPage >= avatarState.total.value) {
      if (page === 0) return
      setPage(page - 1)
    }
  }, [avatarState.total])

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
    avatar.name = 'avatar'
    scene.value.add(avatar)
  }

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(Engine.instance.currentWorld.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

  const loadNextAvatars = (e) => {
    e.preventDefault()
    if ((page + 1) * imgPerPage >= avatarState.total.value) return
    if ((page + 1) * imgPerPage >= avatarState.avatarList.value.length)
      AvatarService.fetchAvatarList(false, 'increment')
    setPage(page + 1)
  }
  const loadPreviousAvatars = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  const confirmAvatar = () => {
    if (selectedAvatar && avatarId != selectedAvatar?.name) {
      setAvatar(
        selectedAvatar?.id || '',
        selectedAvatar?.modelResource?.url || '',
        selectedAvatar?.thumbnailResource?.url || ''
      )
      props.changeActiveMenu(null)
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

  const renderAvatarList = () => {
    const avatarElementList = [] as JSX.Element[]
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, avatarList.length)
    let index = 0
    for (let i = startIndex; i < endIndex; i++, index++) {
      const avatar = avatarList[i]!

      avatarElementList.push(
        <Grid key={avatar.id} md={12} item>
          <Paper
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
          </Paper>
        </Grid>
      )
    }

    return avatarElementList
  }

  return (
    <div className={`${styles.menuPanel} ${styles.avatarSelectPanel}`}>
      <div className={styles.titleBlock}>
        <button type="button" className={styles.iconBlock} onClick={openProfileMenu}>
          <ArrowBack />
        </button>
        <h2>{t('user:avatar.titleSelectAvatar')}</h2>
      </div>

      <Grid sx={{ height: '100%' }} spacing={2} container>
        <Grid item md={3}>
          <Box sx={{ marginTop: '38px' }}>
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

            <Button
              className={styles.gradientBtn}
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
              startIcon={<PersonAdd />}
              title={t('user:avatar.upload')}
              onClick={openAvatarSelectMenu}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            >
              {t('user:avatar.upload')}
            </Button>
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box
            className={styles.preview}
            style={{ width: '100%', aspectRatio: 1, position: 'relative', marginTop: '38px' }}
          >
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
        <Grid item md={3} sx={{ display: 'flex', flexDirection: 'column', height: '90%', alignItems: 'center' }}>
          <button type="button" className={`${styles.btn} ${styles.btnArrow} ${page === 0 ? styles.disabled : ''}`}>
            <KeyboardArrowUp className={styles.size} onClick={loadPreviousAvatars} />
          </button>
          <Grid container spacing={1} className={styles.avatarContainer}>
            {renderAvatarList()}
          </Grid>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnArrow} ${
              (page + 1) * imgPerPage >= avatarState.total.value ? styles.disabled : ''
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
