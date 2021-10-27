import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '../../../../store'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Tooltip from '@mui/material/Tooltip'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import { client } from '../../../../feathers'
import { AlertAction } from '../../../../common/state/AlertService'
import styles from '../UserMenu.module.scss'
import { Views } from '../util'

const CreateLocationMenu = ({ location, changeActiveMenu, updateLocationDetail }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [scenes, setScenes] = useState<{ sid: string; name: string }[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [locationTypes, setLocationTypes] = useState([])
  const [error, setError] = useState({
    name: '',
    maxUsersPerInstance: ''
  })

  useEffect(() => {
    getScenes()
    getLocationTypes()
  }, [])

  const getScenes = () => {
    return client
      .service('collection')
      .find({
        query: {
          $limit: 1000,
          $select: ['id', 'sid', 'name']
        }
      })
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setScenes(res.data)
        }
      })
  }

  const getLocationTypes = () => {
    return client
      .service('location-type')
      .find()
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setLocationTypes(res.data)
        }
      })
  }

  const saveDetails = () => {
    if (validate()) return

    const upsertPromise = location.id
      ? client.service('location').patch(location.id, location)
      : client.service('location').create(location)

    upsertPromise
      .then((_) => {
        dispatch(AlertAction.showAlert('success', t('user:usermenu.newLocation.success')))
        changeActiveMenu(Views.Location)
      })
      .catch((err) => {
        if (err.stack.includes('Name is in use')) {
          setError({ ...error, name: t('user:usermenu.newLocation.nameInUse') })
          return
        }

        dispatch(AlertAction.showAlert('error', t('user:usermenu.newLocation.failure')))
        console.error('Error =>', err)
      })
  }

  const deleteLocation = () => {
    client
      .service('location')
      .remove(location.id)
      .then((_) => {
        dispatch(AlertAction.showAlert('success', t('user:usermenu.newLocation.removeSuccess')))
        changeActiveMenu(Views.Location)
      })
      .catch((err) => {
        dispatch(AlertAction.showAlert('error', t('user:usermenu.newLocation.failure')))
        console.error('Error =>', err)
      })
    setShowDeleteDialog(false)
  }

  const validate = () => {
    const error = {}
    if (!location.name) (error as any).name = t('user:usermenu.newLocation.nameRequire')
    if (location.maxUsersPerInstance != null && isNaN(location.maxUsersPerInstance))
      (error as any).maxUsersPerInstance = t('user:usermenu.newLocation.validNumber')

    setError(error as any)
    return JSON.stringify(error) !== '{}'
  }

  const handleChange = (e) => {
    if (['videoEnabled', 'instanceMediaChatEnabled'].includes(e.target.name)) {
      location.location_setting[e.target.name] = e.target.checked
    } else if (['locationType'].includes(e.target.name)) {
      location.location_setting[e.target.name] = e.target.value
    } else {
      location[e.target.name] = e.target.value
    }

    updateLocationDetail(location)
  }

  return (
    <div className={styles.menuPanel}>
      <section className={styles.locationPanel}>
        <Typography variant="h2">
          <Button className={styles.backbtn} onClick={() => changeActiveMenu(Views.Location)}>
            <ArrowBackIcon />
          </Button>
          {t('user:usermenu.newLocation.title')}
        </Typography>
        <FormControl className={styles.formControl} error={!!error.name}>
          <InputLabel htmlFor="name">{t('user:usermenu.newLocation.lbl-name')}*</InputLabel>
          <TextField
            variant="outlined"
            className={styles.textbox}
            size="small"
            fullWidth
            name="name"
            required
            value={location.name}
            onChange={handleChange}
          />
          <FormHelperText>{error.name}</FormHelperText>
        </FormControl>
        <FormControl className={styles.formControl} error={!!error.maxUsersPerInstance}>
          <InputLabel htmlFor="maxUsersPerInstance">{t('user:usermenu.newLocation.lbl-maxuser')}</InputLabel>
          <TextField
            type="number"
            className={styles.textbox}
            variant="outlined"
            size="small"
            fullWidth
            name="maxUsersPerInstance"
            required
            value={location.maxUsersPerInstance}
            onChange={handleChange}
          />
          <FormHelperText>{error.maxUsersPerInstance}</FormHelperText>
        </FormControl>
        <FormControl className={styles.formControl} size="small">
          <InputLabel htmlFor="sceneId">{t('user:usermenu.newLocation.lbl-scene')}</InputLabel>
          <Select
            labelId="scene"
            variant="outlined"
            className={styles.selectbox}
            name="sceneId"
            value={location.sceneId}
            fullWidth
            MenuProps={{
              className: styles.selectOptionContainer
            }}
            onChange={handleChange}
          >
            {scenes.map((scene) => (
              <MenuItem key={scene.sid} value={scene.sid}>{`${scene.name} (${scene.sid})`}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={styles.formControl} size="small">
          <InputLabel htmlFor="locationType">{t('user:usermenu.newLocation.lbl-type')}</InputLabel>
          <Select
            labelId="locationType"
            variant="outlined"
            className={styles.selectbox}
            name="locationType"
            value={location.location_setting?.locationType}
            onChange={handleChange}
            fullWidth
            MenuProps={{
              className: styles.selectOptionContainer
            }}
          >
            {locationTypes.map((type) => (
              <MenuItem key={type.type} value={type.type}>
                {type.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          className={styles.formControl}
          control={
            <Checkbox
              checked={location.location_setting?.videoEnabled}
              disableRipple
              onChange={handleChange}
              className={styles.checkbox}
              name="videoEnabled"
            />
          }
          label={t('user:usermenu.newLocation.lbl-ve')}
        />
        <FormControlLabel
          className={styles.formControl}
          control={
            <Checkbox
              checked={location.location_setting?.instanceMediaChatEnabled}
              disableRipple
              onChange={handleChange}
              className={styles.checkbox}
              name="instanceMediaChatEnabled"
            />
          }
          label={t('user:usermenu.newLocation.lbl-gme')}
        />
        <Button type="submit" className={styles.savebtn} onClick={saveDetails}>
          {location.id ? t('user:usermenu.newLocation.lbl-update') : t('user:usermenu.newLocation.lbl-create')}
        </Button>
        {location.id && (
          <Tooltip
            title={location.isLobby ? t('user:usermenu.newLocation.tooltipCanNotBeDeleted') : ''}
            arrow
            placement="bottom"
            className={styles.tooltip}
          >
            <span className={styles.deleteBtnContainer}>
              <Button
                type="submit"
                onClick={() => setShowDeleteDialog(true)}
                disabled={location.isLobby}
                className={styles.deletebtn}
                disableRipple
              >
                <DeleteIcon />
              </Button>
            </span>
          </Tooltip>
        )}
        {showDeleteDialog && (
          <div className={styles.deleteDialogContainer}>
            <div className={styles.dialog}>
              <Typography variant="h2">{t('user:usermenu.newLocation.confirmation')}</Typography>
              <div className={styles.btnContainer}>
                <Button onClick={deleteLocation} className={styles.yesbtn}>
                  {t('user:usermenu.newLocation.lbl-yes')}
                </Button>
                <Button onClick={() => setShowDeleteDialog(false)} className={styles.nobtn}>
                  {t('user:usermenu.newLocation.lbl-no')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default CreateLocationMenu
