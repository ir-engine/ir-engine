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
import IconButton from '@mui/material/IconButton'

import { useAuthState } from '../../../user/services/AuthService'
import AlertMessage from '../../common/AlertMessage'
import InputSelect, { InputSelectProps } from '../../common/InputSelect'
import InputText from '../../common/InputText'
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

  const locationsMenu: InputSelectProps[] = locationData.value.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  const instancesMenu: InputSelectProps[] = currentInstance.map((el) => {
    return {
      label: el.ipAddress,
      value: el.id
    }
  })

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
          <InputText
            name="name"
            label={t('admin:components.bot.name')}
            value={state.name}
            error={formErrors.name}
            handleInputChange={handleInputChange}
          />

          <InputText
            name="description"
            label={t('admin:components.bot.description')}
            value={state.description}
            error={formErrors.description}
            handleInputChange={handleInputChange}
          />

          <InputSelect
            name="location"
            label={t('admin:components.bot.location')}
            value={state.location}
            error={formErrors.location}
            menu={locationsMenu}
            handleInputChange={handleInputChange}
            endControl={
              <IconButton onClick={fetchAdminLocations} size="large">
                <Autorenew style={{ color: 'var(--iconButtonColor)' }} />
              </IconButton>
            }
          />

          <InputSelect
            name="instance"
            label={t('admin:components.bot.instance')}
            value={state.instance}
            menu={instancesMenu}
            handleInputChange={handleInputChange}
            endControl={
              <IconButton onClick={fetchAdminInstances} size="large">
                <Autorenew style={{ color: 'var(--iconButtonColor)' }} />
              </IconButton>
            }
          />
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
