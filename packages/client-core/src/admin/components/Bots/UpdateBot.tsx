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

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminBotService } from '../../services/BotsService'
import { AdminInstanceService, useAdminInstanceState } from '../../services/InstanceService'
import { AdminLocationService, useAdminLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  bot?: AdminBot
  onClose: () => void
}

const UpdateBot = ({ open, bot, onClose }: Props) => {
  const adminInstanceState = useAdminInstanceState()
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
  const adminLocation = useAdminLocationState()
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

  const locationsMenu: InputMenuItem[] = locationData.value.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  const instancesMenu: InputMenuItem[] = currentInstance.map((el) => {
    return {
      label: el.ipAddress,
      value: el.id
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    let temp = { ...formErrors }

    switch (name) {
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
    setState({ ...state, [name]: value })
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

    let tempErrors = {
      ...formErrors,
      name: state.name ? '' : t('admin:components.bot.nameCantEmpty'),
      description: state.description ? '' : t('admin:components.bot.descriptionCantEmpty'),
      location: state.location ? '' : t('admin:components.bot.locationCantEmpty')
    }

    setFormErrors(tempErrors)

    if (validateForm(state, tempErrors) && bot) {
      AdminBotService.updateBotAsAdmin(bot.id, data)
      setState({ name: '', description: '', instance: '', location: '' })
      setCurrentIntance([])
      onClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
    }
  }

  const fetchAdminInstances = () => {
    AdminInstanceService.fetchAdminInstances()
  }

  const fetchAdminLocations = () => {
    AdminLocationService.fetchAdminLocations()
  }

  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title" classes={{ paper: styles.paperDialog }} onClose={onClose}>
        <DialogTitle id="form-dialog-title">{t('admin:components.bot.updateBot')}</DialogTitle>
        <DialogContent>
          <InputText
            name="name"
            label={t('admin:components.bot.name')}
            value={state.name}
            error={formErrors.name}
            onChange={handleInputChange}
          />

          <InputText
            name="description"
            label={t('admin:components.bot.description')}
            value={state.description}
            error={formErrors.description}
            onChange={handleInputChange}
          />

          <InputSelect
            name="location"
            label={t('admin:components.bot.location')}
            value={state.location}
            error={formErrors.location}
            menu={locationsMenu}
            onChange={handleInputChange}
            endControl={
              <IconButton onClick={fetchAdminLocations}>
                <Autorenew style={{ color: 'var(--iconButtonColor)' }} />
              </IconButton>
            }
          />

          <InputSelect
            name="instance"
            label={t('admin:components.bot.instance')}
            value={state.instance}
            menu={instancesMenu}
            onChange={handleInputChange}
            endControl={
              <IconButton onClick={fetchAdminInstances}>
                <Autorenew style={{ color: 'var(--iconButtonColor)' }} />
              </IconButton>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            disableElevation
            type="submit"
            onClick={() => {
              setState({ name: '', description: '', instance: '', location: '' })
              setFormErrors({ name: '', description: '', location: '' })
              onClose()
            }}
            className={styles.outlinedButton}
          >
            {t('admin:components.common.cancel')}
          </Button>
          <Button
            variant="contained"
            disableElevation
            type="submit"
            className={styles.gradientButton}
            onClick={handleUpdate}
          >
            <Save style={{ marginRight: '10px' }} /> {t('admin:components.common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default UpdateBot
