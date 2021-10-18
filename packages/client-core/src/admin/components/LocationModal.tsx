import Backdrop from '@material-ui/core/Backdrop'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Modal from '@material-ui/core/Modal'
import Select from '@material-ui/core/Select'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '../../store'
import { LocationService } from '../state/LocationService'
import styles from './Admin.module.scss'
import Tooltip from '@material-ui/core/Tooltip'
import { useTranslation } from 'react-i18next'
import { useSceneState } from '../state/SceneState'
import { useLocationState } from '../state/LocationState'

import { Location } from '@xrengine/common/src/interfaces/Location'

interface Props {
  open: boolean
  handleClose: any
  location: Location
  editing: boolean
}

const LocationModal = (props: Props): any => {
  const { open, handleClose, location, editing } = props
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [sceneId, setSceneId] = useState('')
  const [maxUsers, setMaxUsers] = useState(10)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [instanceMediaChatEnabled, setInstanceMediaChatEnabled] = useState(false)
  const [locationType, setLocationType] = useState('private')
  const adminSceneState = useSceneState()
  const adminScenes = adminSceneState.scenes.scenes
  const locationTypes = useLocationState().locationTypes.locationTypes
  const [state, setState] = React.useState({
    feature: false,
    lobby: false
  })
  const { t } = useTranslation()

  const submitLocation = () => {
    const submission = {
      name: name,
      sceneId: sceneId,
      maxUsersPerInstance: maxUsers,
      location_setting: {
        locationType: locationType,
        instanceMediaChatEnabled: instanceMediaChatEnabled,
        videoEnabled: videoEnabled
      },
      isLobby: state.lobby,
      isFeatured: state.feature
    }

    if (editing === true) {
      LocationService.patchLocation(location.id, submission)
    } else {
      LocationService.createLocation(submission)
    }

    handleClose()
  }

  const deleteLocation = () => {
    LocationService.removeLocation(location.id)
    handleClose()
  }

  useEffect(() => {
    if (editing === true) {
      setName(location.name)
      setSceneId(location.sceneId || '')
      setMaxUsers(location.maxUsersPerInstance)
      setVideoEnabled(location.location_settings.videoEnabled)
      setInstanceMediaChatEnabled(location.location_settings.instanceMediaChatEnabled)
      setLocationType(location.location_settings.locationType)
      setState({
        lobby: location.isLobby,
        feature: location.isFeatured
      })
    } else {
      setName('')
      setSceneId('')
      setMaxUsers(10)
      setVideoEnabled(false)
      setInstanceMediaChatEnabled(false)
      setLocationType('private')
    }
  }, [location])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles['modal-content']]: true
            })}
          >
            {editing === true && (
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="id"
                label="ID"
                name="id"
                disabled
                defaultValue={location?.id}
              >
                {location.id}
              </TextField>
            )}
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="name"
              label={t('admin:components.locationModel.lbl-name')}
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              type="number"
              variant="outlined"
              margin="normal"
              fullWidth
              id="maxUsers"
              label={t('admin:components.locationModel.lbl-maxuser')}
              name="name"
              required
              value={maxUsers}
              onChange={(e) => setMaxUsers(parseInt(e.target.value))}
            />
            <FormControl>
              <InputLabel id="scene">{t('admin:components.locationModel.lbl-scene')}</InputLabel>
              <Select labelId="scene" id="scene" value={sceneId} onChange={(e) => setSceneId(e.target.value as string)}>
                {adminScenes.value.map((scene) => (
                  <MenuItem key={scene.sid} value={scene.sid}>{`${scene.name} (${scene.sid})`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="locationType">{t('admin:components.locationModel.lbl-type')}</InputLabel>
              <Select
                labelId="locationType"
                id="locationType"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as string)}
              >
                {locationTypes.value.map((type) => (
                  <MenuItem key={type.type} value={type.type}>
                    {type.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormGroup>
              <FormControl style={{ color: 'black' }}>
                <FormControlLabel
                  color="primary"
                  control={
                    <Switch
                      checked={videoEnabled}
                      onChange={(e) => setVideoEnabled(e.target.checked)}
                      name="videoEnabled"
                    />
                  }
                  label={t('admin:components.locationModel.lbl-ve')}
                />
              </FormControl>
            </FormGroup>
            <FormGroup>
              <FormControl style={{ color: 'black' }}>
                <FormControlLabel
                  color="primary"
                  control={
                    <Switch
                      checked={instanceMediaChatEnabled}
                      onChange={(e) => setInstanceMediaChatEnabled(e.target.checked)}
                      name="instanceMediaChatEnabled"
                    />
                  }
                  label={t('admin:components.locationModel.lbl-gme')}
                />
              </FormControl>
            </FormGroup>

            {!location.isLobby && (
              <FormControlLabel
                control={<Checkbox checked={state.lobby} onChange={handleChange} name="lobby" color="primary" />}
                label={t('admin:components.locationModel.lbl-lobby')}
              />
            )}
            <FormControlLabel
              control={<Checkbox checked={state.feature} onChange={handleChange} name="feature" color="primary" />}
              label={t('admin:components.locationModel.lbl-featured')}
            />
            <FormGroup row className={styles.locationModalButtons}>
              {editing === true && (
                <Button type="submit" variant="contained" color="primary" onClick={submitLocation}>
                  {t('admin:components.locationModel.lbl-update')}
                </Button>
              )}
              {editing !== true && (
                <Button type="submit" variant="contained" color="primary" onClick={submitLocation}>
                  {t('admin:components.locationModel.lbl-create')}
                </Button>
              )}
              <Button type="submit" variant="contained" onClick={handleClose}>
                {t('admin:components.locationModel.lbl-cancel')}
              </Button>
              {editing === true && (
                <Tooltip
                  title={state.lobby ? t('admin:components.locationModel.tooltipCanNotBeDeleted') : ''}
                  arrow
                  placement="top"
                >
                  <span>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      onClick={deleteLocation}
                      disabled={location.isLobby}
                    >
                      {t('admin:components.locationModel.lbl-delete')}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </FormGroup>
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default LocationModal
