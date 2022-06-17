import _ from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'

import { NotificationService } from '../../../common/services/NotificationService'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputSwitch from '../../common/InputSwitch'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminLocationService, useAdminLocationState } from '../../services/LocationService'
import { useAdminSceneState } from '../../services/SceneService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  onClose: () => void
}

const CreateLocation = ({ open, onClose }: Props) => {
  const [state, setState] = React.useState({
    name: '',
    maxUsers: 10,
    scene: '',
    type: 'private',
    videoEnabled: false,
    audioEnabled: false,
    screenSharingEnabled: false,
    faceStreamingEnabled: false,
    globalMediaEnabled: false,
    isLobby: false,
    isFeatured: false,
    formErrors: {
      name: '',
      maxUsers: '',
      scene: '',
      type: ''
    }
  })

  const { t } = useTranslation()
  const adminLocationState = useAdminLocationState()
  const locationTypes = adminLocationState.locationTypes
  const location = adminLocationState
  const adminScenes = useAdminSceneState().scenes

  const clearState = () => {
    setState({
      ...state,
      name: '',
      maxUsers: 10,
      scene: '',
      type: 'private',
      videoEnabled: false,
      audioEnabled: false,
      screenSharingEnabled: false,
      faceStreamingEnabled: false,
      globalMediaEnabled: false,
      isLobby: false,
      isFeatured: false
    })
  }

  React.useEffect(() => {
    if (location.created.value) {
      clearState()
      onClose()
    }
  }, [location.created])

  const handleChange = (e) => {
    const { name, value } = e.target

    let temp = { ...state.formErrors }
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} ${t('admin:components.locationModal.isRequired')}` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data = {
      name: state.name,
      sceneId: state.scene,
      maxUsersPerInstance: state.maxUsers,
      location_settings: {
        locationType: state.type,
        instanceMediaChatEnabled: state.globalMediaEnabled,
        audioEnabled: state.audioEnabled,
        screenSharingEnabled: state.screenSharingEnabled,
        faceStreamingEnabled: state.faceStreamingEnabled,
        videoEnabled: state.videoEnabled
      },
      isLobby: state.isLobby,
      isFeatured: state.isFeatured
    }

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.locationModal.nameCantEmpty'),
      maxUsers: state.maxUsers ? '' : t('admin:components.locationModal.maxUserCantEmpty'),
      scene: state.scene ? '' : t('admin:components.locationModal.sceneCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      AdminLocationService.createLocation(data)
      clearState()
      onClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.locationModal.fillRequiredFields'), { variant: 'error' })
    }
  }

  const sceneMenu: InputMenuItem[] = adminScenes.value.map((el) => {
    return {
      value: `${el.project}/${el.name}`,
      label: `${el.name} (${el.project})`
    }
  })

  const locationMenu: InputMenuItem[] = locationTypes.value.map((el) => {
    return {
      value: el.type,
      label: el.type
    }
  })

  return (
    <React.Fragment>
      <Drawer anchor="right" classes={{ paper: styles.paperDrawer }} open={open} onClose={onClose}>
        <Container maxWidth="sm" className={styles.mt20}>
          <DialogTitle id="form-dialog-title" className={styles.textAlign}>
            {t('admin:components.locationModal.createNewLocation')}
          </DialogTitle>

          <InputText
            name="name"
            label={t('admin:components.locationModal.lbl-name')}
            placeholder={t('admin:components.locationModal.enterName')}
            value={state.name ?? ''}
            error={state.formErrors.name}
            onChange={handleChange}
          />

          <InputText
            name="maxUsers"
            label={t('admin:components.locationModal.lbl-maxuser')}
            placeholder={t('admin:components.group.enterMaxUsers')}
            value={state.maxUsers}
            error={state.formErrors.maxUsers}
            type="number"
            onChange={handleChange}
          />

          <InputSelect
            name="scene"
            label={t('admin:components.locationModal.lbl-scene')}
            value={state.scene}
            error={state.formErrors.scene}
            menu={sceneMenu}
            onChange={handleChange}
          />

          <InputSelect
            name="type"
            label={t('admin:components.locationModal.type')}
            value={state.type}
            menu={locationMenu}
            onChange={handleChange}
          />

          <Grid container spacing={5} className={styles.mb15}>
            <Grid item xs={6}>
              <InputSwitch
                name="videoEnabled"
                label={t('admin:components.locationModal.lbl-ve')}
                checked={state.videoEnabled}
                onChange={(e) => setState({ ...state, videoEnabled: e.target.checked })}
              />

              <InputSwitch
                name="audioEnabled"
                label={t('admin:components.locationModal.lbl-ae')}
                checked={state.audioEnabled}
                onChange={(e) => setState({ ...state, audioEnabled: e.target.checked })}
              />

              <InputSwitch
                name="globalMediaEnabled"
                label={t('admin:components.locationModal.lbl-gme')}
                checked={state.globalMediaEnabled}
                onChange={(e) => setState({ ...state, globalMediaEnabled: e.target.checked })}
              />

              <InputSwitch
                name="screenSharingEnabled"
                label={t('admin:components.locationModal.lbl-se')}
                checked={state.screenSharingEnabled}
                onChange={(e) => setState({ ...state, screenSharingEnabled: e.target.checked })}
              />
            </Grid>
            <Grid item xs={6} style={{ display: 'flex' }}>
              <div style={{ marginLeft: 'auto' }}>
                <InputSwitch
                  name="faceStreamingEnabled"
                  label={t('admin:components.locationModal.lbl-lobby')}
                  checked={state.faceStreamingEnabled}
                  onChange={(e) => setState({ ...state, faceStreamingEnabled: e.target.checked })}
                />

                <InputSwitch
                  name="isLobby"
                  label={t('admin:components.locationModal.lbl-fe')}
                  checked={state.isLobby}
                  onChange={(e) => setState({ ...state, isLobby: e.target.checked })}
                />

                <InputSwitch
                  name="isFeatured"
                  label={t('admin:components.locationModal.lbl-featured')}
                  checked={state.isFeatured}
                  onChange={(e) => setState({ ...state, isFeatured: e.target.checked })}
                />
              </div>
            </Grid>
          </Grid>
          <DialogActions>
            <Button className={styles.submitButton} onClick={handleSubmit}>
              {t('admin:components.locationModal.submit')}
            </Button>
            <Button
              className={styles.cancelButton}
              onClick={() => {
                clearState()
                onClose()
              }}
            >
              {t('admin:components.locationModal.lbl-cancel')}
            </Button>
          </DialogActions>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default CreateLocation
