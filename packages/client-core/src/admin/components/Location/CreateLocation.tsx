import _ from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'

import AlertMessage from '../../common/AlertMessage'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { LocationService, useLocationState } from '../../services/LocationService'
import { useSceneState } from '../../services/SceneService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  handleClose: (open: boolean) => void
  closeViewModal?: (open: boolean) => void
}

const CreateLocation = (props: Props) => {
  const { open, closeViewModal } = props
  const [openWarning, setOpenWarning] = React.useState(false)
  const [error, setError] = React.useState('')
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
  const adminLocationState = useLocationState()
  const locationTypes = adminLocationState.locationTypes
  const location = adminLocationState
  const adminScenes = useSceneState().scenes

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
      closeViewModal && closeViewModal(false)
      clearState()
    }
  }, [location.created])

  const handleCloseWarning = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenWarning(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
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
    const temp = state.formErrors
    if (!state.name) {
      temp.name = t('admin:components.locationModal.nameCantEmpty')
    }
    if (!state.maxUsers) {
      temp.maxUsers = t('admin:components.locationModal.maxUserCantEmpty')
    }
    if (!state.scene) {
      temp.scene = t('admin:components.locationModal.sceneCantEmpty')
    }
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
      LocationService.createLocation(data)
      clearState()
      closeViewModal && closeViewModal(false)
    } else {
      setError(t('admin:components.locationModal.fillRequiredFields'))
      setOpenWarning(true)
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
      <Drawer
        anchor="right"
        classes={{ paper: styles.paperDrawer }}
        open={open}
        onClose={() => {
          closeViewModal && closeViewModal(false)
        }}
      >
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
              <FormGroup>
                <FormControl>
                  <FormControlLabel
                    color="primary"
                    control={
                      <Switch
                        checked={state.videoEnabled}
                        onChange={(e) => setState({ ...state, videoEnabled: e.target.checked })}
                        name="videoEnabled"
                      />
                    }
                    label={t('admin:components.locationModal.lbl-ve') as string}
                  />
                </FormControl>
              </FormGroup>
              <FormGroup>
                <FormControl>
                  <FormControlLabel
                    color="primary"
                    control={
                      <Switch
                        checked={state.audioEnabled}
                        onChange={(e) => setState({ ...state, audioEnabled: e.target.checked })}
                        name="audioEnabled"
                      />
                    }
                    label={t('admin:components.locationModal.lbl-ae') as string}
                  />
                </FormControl>
              </FormGroup>
              <FormGroup>
                <FormControl>
                  <FormControlLabel
                    color="primary"
                    control={
                      <Switch
                        checked={state.globalMediaEnabled}
                        onChange={(e) => setState({ ...state, globalMediaEnabled: e.target.checked })}
                        name="globalMediaEnabled"
                      />
                    }
                    label={t('admin:components.locationModal.lbl-gme') as string}
                  />
                </FormControl>
              </FormGroup>
              <FormGroup>
                <FormControl>
                  <FormControlLabel
                    color="primary"
                    control={
                      <Switch
                        checked={state.screenSharingEnabled}
                        onChange={(e) => setState({ ...state, screenSharingEnabled: e.target.checked })}
                        name="screenSharingEnabled"
                      />
                    }
                    label={t('admin:components.locationModal.lbl-se') as string}
                  />
                </FormControl>
              </FormGroup>
            </Grid>
            <Grid item xs={6} style={{ display: 'flex' }}>
              <div style={{ marginLeft: 'auto' }}>
                <FormGroup>
                  <FormControl>
                    <FormControlLabel
                      color="primary"
                      control={
                        <Switch
                          checked={state.faceStreamingEnabled}
                          onChange={(e) => setState({ ...state, faceStreamingEnabled: e.target.checked })}
                          name="faceStreamingEnabled"
                        />
                      }
                      label={t('admin:components.locationModal.lbl-fe') as string}
                    />
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <FormControl>
                    <FormControlLabel
                      color="primary"
                      control={
                        <Switch
                          checked={state.isLobby}
                          onChange={(e) => setState({ ...state, isLobby: e.target.checked })}
                          name="isLobby"
                        />
                      }
                      label={t('admin:components.locationModal.lbl-lobby') as string}
                    />
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <FormControl>
                    <FormControlLabel
                      color="primary"
                      control={
                        <Switch
                          checked={state.isFeatured}
                          onChange={(e) => setState({ ...state, isFeatured: e.target.checked })}
                          name="isFeatured"
                        />
                      }
                      label={t('admin:components.locationModal.lbl-featured') as string}
                    />
                  </FormControl>
                </FormGroup>
              </div>
            </Grid>
          </Grid>
          <DialogActions>
            <Button className={styles.submitButton} onClick={handleSubmit}>
              {t('admin:components.locationModal.submit')}
            </Button>
            <Button
              onClick={() => {
                clearState()
                closeViewModal && closeViewModal(false)
              }}
              className={styles.cancelButton}
            >
              {t('admin:components.locationModal.lbl-cancel')}
            </Button>
          </DialogActions>
        </Container>
      </Drawer>
      <AlertMessage open={openWarning} handleClose={handleCloseWarning} severity="warning" message={error} />
    </React.Fragment>
  )
}

export default CreateLocation
