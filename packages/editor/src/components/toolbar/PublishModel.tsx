import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Modal from '@mui/material/Modal'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { LocationService } from '@xrengine/client-core/src/admin/services/LocationService'

import styles from './styles.module.scss'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import { useSceneState } from '@xrengine/client-core/src/admin/services/SceneService'
import { useLocationState } from '@xrengine/client-core/src/admin/services/LocationService'
import { useParams } from 'react-router-dom'
import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'

interface Props {
  open: boolean
  handleClose: any
  location: any
  editing: boolean
}

const LocationModal = (props: Props): any => {
  const { open, handleClose, location, editing } = props

  const [name, setName] = useState('')
  const [sceneId, setSceneId] = useState('')
  const [maxUsers, setMaxUsers] = useState(10)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [instanceMediaChatEnabled, setInstanceMediaChatEnabled] = useState(false)
  const [scene, setScene] = useState<SceneDetailInterface>(null!)
  const [locationType, setLocationType] = useState('private')
  const adminScenes = useSceneState().scenes
  const locationTypes = useLocationState().locationTypes
  const dispatch = useDispatch()
  const [state, setState] = React.useState({
    feature: false,
    lobby: false
  })
  const { t } = useTranslation()
  const currentScene = useParams()

  const submitLocation = () => {
    // const submission = {
    //   name: name,
    //   sceneId: sceneId,
    //   maxUsersPerInstance: maxUsers,
    //   location_setting: {
    //     locationType: locationType,
    //     instanceMediaChatEnabled: instanceMediaChatEnabled,
    //     videoEnabled: videoEnabled
    //   },
    //   isLobby: state.lobby,
    //   isFeatured: state.feature
    // }

    const submission = {
      ...scene,
      scene: {
        model_file_id: 'model_file_id',
        screenshot_file_id: 'screenshot_file_id',
        id: (scene as any).id
      }
    }

    if (editing === true) {
      LocationService.patchLocation(location.id, submission)
    } else {
      // TODO
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
      setVideoEnabled(location.location_setting.videoEnabled)
      setInstanceMediaChatEnabled(location.location_setting.instanceMediaChatEnabled)
      setLocationType(location.location_setting.locationType)
      setState({
        lobby: location.isLobby,
        feature: location.isFeature
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

  useEffect(() => {
    if (currentScene) {
      const temp = adminScenes.value.find((el) => (el as any).sid === (currentScene as any).projectId)
      //console.log('====================================')
      //console.log(temp)
      //console.log('====================================')
      if (temp) setScene(temp)
    }
  }, [adminScenes, currentScene])

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
            {scene ? (
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                fullWidth
                id="scene"
                label={t('admin:components.locationModel.lbl-scene')}
                name="scene"
                required
                value={`${scene.name} (${(scene as any).sid})`}
                onChange={(e) => setSceneId(e.target.value as string)}
                disabled
              />
            ) : (
              <FormControl>
                <InputLabel id="scene">{t('admin:components.locationModel.lbl-scene')}</InputLabel>
                <Select
                  labelId="scene"
                  id="scene"
                  value={sceneId}
                  onChange={(e) => setSceneId(e.target.value as string)}
                >
                  {adminScenes.value.map((scene) => (
                    <MenuItem key={(scene as any).sid} value={(scene as any).sid}>{`${scene.name} (${
                      (scene as any).sid
                    })`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
                  label={t('admin:components.locationModel.lbl-ve') as string}
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
                  label={t('admin:components.locationModel.lbl-gme') as string}
                />
              </FormControl>
            </FormGroup>

            {!location.isLobby && (
              <FormControlLabel
                control={<Checkbox checked={state.lobby} onChange={handleChange} name="lobby" color="primary" />}
                label={t('admin:components.locationModel.lbl-lobby') as string}
              />
            )}
            <FormControlLabel
              control={<Checkbox checked={state.feature} onChange={handleChange} name="feature" color="primary" />}
              label={t('admin:components.locationModel.lbl-featured') as string}
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
                  title={state.lobby ? t('admin:components.locationModel.tooltipCanNotBeDeleted') || '' : ''}
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
