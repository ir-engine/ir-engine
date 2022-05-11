import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CreateBotAsAdmin } from '@xrengine/common/src/interfaces/AdminBot'
import { AdminBot } from '@xrengine/common/src/interfaces/AdminBot'
import { Instance } from '@xrengine/common/src/interfaces/Instance'

import { Autorenew, Save } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'

import { useAuthState } from '../../../user/services/AuthService'
import AlertMessage from '../../common/AlertMessage'
import { validateForm } from '../../common/validation/formValidation'
import { BotService } from '../../services/BotsService'
import { InstanceService, useInstanceState } from '../../services/InstanceService'
import { LocationService, useLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  handleClose: () => void
  bot?: AdminBot
}

const UpdateBot = (props: Props) => {
  const { open, handleClose, bot } = props
  const adminInstanceState = useInstanceState()
  const [state, setState] = useState({
    name: '',
    description: '',
    instance: '',
    location: ''
  })
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    location: ''
  })
  const [currentInstance, setCurrentIntance] = useState<Instance[]>([])
  const [openAlter, setOpenAlter] = useState(false)
  const [error, setError] = useState('')
  const adminLocation = useLocationState()
  const locationData = adminLocation.locations
  const adminInstances = adminInstanceState
  const instanceData = adminInstances.instances
  const user = useAuthState().user
  const { t } = useTranslation()

  useEffect(() => {
    if (bot) {
      setState({
        name: bot?.name,
        description: bot?.description,
        instance: bot?.instance?.id || '',
        location: bot?.location?.id || ''
      })
    }
  }, [bot])

  const handleInputChange = (e) => {
    const names = e.target.name
    const value = e.target.value
    let temp = formErrors
    switch (names) {
      case 'name':
        temp.name = value.length < 2 ? t('admin:components.bot.nameCantEmpty') : ''
        break
      case 'description':
        temp.description = value.length < 2 ? t('admin:components.bot.descriptionCantEmpty') : ''
        break
      case 'location':
        temp.location = value.length < 2 ? t('admin:components.bot.locationCantEmpty') : ''
        break
      default:
        break
    }
    setFormErrors(temp)
    setState({ ...state, [names]: value })
  }

  const data: Instance[] = instanceData.value.map((element) => {
    return element
  })

  useEffect(() => {
    const instanceFilter = data.filter((el) => el.locationId === state.location)
    if (instanceFilter.length > 0) {
      setState({ ...state, instance: state.instance || '' })
      setCurrentIntance(instanceFilter)
    } else {
      setCurrentIntance([])
      setState({ ...state, instance: '' })
    }
  }, [state.location, adminInstanceState.instances.value.length])

  const handleUpdate = () => {
    const data: CreateBotAsAdmin = {
      name: state.name,
      instanceId: state.instance || null,
      userId: user.id.value,
      description: state.description,
      locationId: state.location
    }
    let temp = formErrors
    if (!state.name) {
      temp.name = t('admin:components.bot.nameCantEmpty')
    }
    if (!state.description) {
      temp.description = t('admin:components.bot.descriptionCantEmpty')
    }
    if (!state.location) {
      temp.location = t('admin:components.bot.locationCantEmpty')
    }
    setFormErrors(temp)
    if (validateForm(state, formErrors) && bot) {
      BotService.updateBotAsAdmin(bot.id, data)
      setState({ name: '', description: '', instance: '', location: '' })
      setCurrentIntance([])
      handleClose()
    } else {
      setError(t('admin:components.bot.fillRequiredField'))
      setOpenAlter(true)
    }
  }

  const fetchAdminInstances = () => {
    InstanceService.fetchAdminInstances()
  }

  const handleCloseAlter = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenAlter(false)
  }

  const fetchAdminLocations = () => {
    LocationService.fetchAdminLocations()
  }

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="form-dialog-title"
        classes={{ paper: styles.paperDialog }}
        onClose={handleClose}
      >
        <DialogTitle id="form-dialog-title">{t('admin:components.bot.updateBot')}</DialogTitle>
        <DialogContent>
          <label>{t('admin:components.bot.name')}</label>
          <Paper component="div" className={formErrors.name.length > 0 ? styles.redBorder : styles.createInput}>
            <InputBase
              name="name"
              className={styles.input}
              placeholder="Enter name"
              value={state.name}
              onChange={handleInputChange}
            />
          </Paper>
          <label>{t('admin:components.bot.description')}</label>
          <Paper component="div" className={formErrors.description.length > 0 ? styles.redBorder : styles.createInput}>
            <InputBase
              className={styles.input}
              name="description"
              placeholder={t('admin:components.bot.enterDescription')}
              value={state.description}
              onChange={handleInputChange}
            />
          </Paper>

          <label>{t('admin:components.bot.location')}</label>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <Paper component="div" className={formErrors.location.length > 0 ? styles.redBorder : styles.createInput}>
                <FormControl className={styles.createInput} fullWidth>
                  <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    value={state.location}
                    fullWidth
                    onChange={handleInputChange}
                    name="location"
                    displayEmpty
                    className={styles.select}
                    MenuProps={{ classes: { paper: styles.selectPaper } }}
                  >
                    <MenuItem
                      value=""
                      disabled
                      classes={{
                        root: styles.menuItem
                      }}
                    >
                      <em>{t('admin:components.bot.selectLocation')}</em>
                    </MenuItem>
                    {locationData.value.map((el) => (
                      <MenuItem
                        value={el.id}
                        key={el.id}
                        classes={{
                          root: styles.menuItem
                        }}
                      >
                        {el.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
            <Grid item xs={2} style={{ display: 'flex' }}>
              <div style={{ marginLeft: 'auto' }}>
                <IconButton onClick={fetchAdminLocations} size="large">
                  <Autorenew style={{ color: 'var(--iconButtonColor)' }} />
                </IconButton>
              </div>
            </Grid>
          </Grid>

          <label>{t('admin:components.bot.instance')}</label>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <Paper component="div" className={styles.createInput}>
                <FormControl
                  className={styles.createInput}
                  fullWidth
                  disabled={currentInstance.length > 0 ? false : true}
                >
                  <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    value={state.instance}
                    fullWidth
                    displayEmpty
                    onChange={handleInputChange}
                    className={styles.select}
                    name="instance"
                    MenuProps={{ classes: { paper: styles.selectPaper } }}
                  >
                    <MenuItem
                      value=""
                      disabled
                      classes={{
                        root: styles.menuItem
                      }}
                    >
                      <em>{t('admin:components.bot.selectInstance')}</em>
                    </MenuItem>
                    {currentInstance.map((el) => (
                      <MenuItem
                        value={el.id}
                        key={el.id}
                        classes={{
                          root: styles.menuItem
                        }}
                      >
                        {el.ipAddress}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
            <Grid item xs={2} style={{ display: 'flex' }}>
              <div style={{ marginLeft: 'auto' }}>
                <IconButton onClick={fetchAdminInstances} size="large">
                  <Autorenew style={{ color: 'var(--iconButtonColor)' }} />
                </IconButton>
              </div>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions style={{ marginRight: '15px' }}>
          <Button
            variant="outlined"
            disableElevation
            type="submit"
            onClick={() => {
              setState({ name: '', description: '', instance: '', location: '' })
              setFormErrors({ name: '', description: '', location: '' })
              handleClose()
            }}
            className={styles.submitButton}
          >
            {t('admin:components.bot.cancel')}
          </Button>
          <Button
            variant="contained"
            disableElevation
            type="submit"
            className={styles.openModalBtn}
            onClick={handleUpdate}
          >
            <Save style={{ marginRight: '10px' }} /> {t('admin:components.bot.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <AlertMessage open={openAlter} handleClose={handleCloseAlter} severity="warning" message={error} />
    </div>
  )
}

export default UpdateBot
