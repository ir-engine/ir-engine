import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { CreateBotAsAdmin } from '@etherealengine/common/src/interfaces/AdminBot'
import { AdminBot } from '@etherealengine/common/src/interfaces/AdminBot'
import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Dialog from '@etherealengine/ui/src/primitives/mui/Dialog'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogContent from '@etherealengine/ui/src/primitives/mui/DialogContent'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { NotificationService } from '../../../common/services/NotificationService'
import { AuthState } from '../../../user/services/AuthService'
import { validateForm } from '../../common/validation/formValidation'
import { AdminBotService } from '../../services/BotsService'
import { AdminInstanceService, AdminInstanceState } from '../../services/InstanceService'
import { AdminLocationService, AdminLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  bot?: AdminBot
  onClose: () => void
}

const UpdateBot = ({ open, bot, onClose }: Props) => {
  const state = useHookstate({
    name: '',
    description: '',
    instance: '',
    location: ''
  })
  const formErrors = useHookstate({
    name: '',
    description: '',
    location: ''
  })
  const currentInstance = useHookstate<Instance[]>([])
  const adminInstanceState = useHookstate(getMutableState(AdminInstanceState))
  const locationData = useHookstate(getMutableState(AdminLocationState).locations)
  const instanceData = adminInstanceState.instances
  const user = useHookstate(getMutableState(AuthState).user)
  const { t } = useTranslation()

  useEffect(() => {
    if (bot) {
      state.set({
        name: bot?.name,
        description: bot?.description,
        instance: bot?.instance?.id || '',
        location: bot?.location?.id || ''
      })
    }
  }, [bot])

  const locationsMenu: InputMenuItem[] = locationData.get({ noproxy: true }).map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  const instancesMenu: InputMenuItem[] = currentInstance.get({ noproxy: true }).map((el) => {
    return {
      label: el.ipAddress,
      value: el.id
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    switch (name) {
      case 'name':
        formErrors.merge({ name: value.length < 2 ? t('admin:components.bot.nameCantEmpty') : '' })
        break
      case 'description':
        formErrors.merge({ description: value.length < 2 ? t('admin:components.bot.descriptionCantEmpty') : '' })
        break
      case 'location':
        formErrors.merge({ location: value.length < 2 ? t('admin:components.bot.locationCantEmpty') : '' })
        break
      default:
        break
    }
    state.merge({ [name]: value })
  }

  const data: Instance[] = instanceData.get({ noproxy: true }).map((element) => {
    return element
  })

  useEffect(() => {
    const instanceFilter = data.filter((el) => el.locationId === state.location.value)
    if (instanceFilter.length > 0) {
      state.merge({ instance: state.instance.value || '' })
      currentInstance.set(instanceFilter)
    } else {
      currentInstance.set([])
      state.merge({ instance: '' })
    }
  }, [state.location.value, adminInstanceState.instances.value.length])

  const handleUpdate = () => {
    const data: CreateBotAsAdmin = {
      name: state.name.value,
      instanceId: state.instance.value || null,
      userId: user.id.value,
      description: state.description.value,
      locationId: state.location.value
    }

    formErrors.merge({
      name: state.name.value ? '' : t('admin:components.bot.nameCantEmpty'),
      description: state.description.value ? '' : t('admin:components.bot.descriptionCantEmpty'),
      location: state.location.value ? '' : t('admin:components.bot.locationCantEmpty')
    })

    if (validateForm(state.value, formErrors.value) && bot) {
      AdminBotService.updateBotAsAdmin(bot.id, data)
      state.set({ name: '', description: '', instance: '', location: '' })
      currentInstance.set([])
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
      <Dialog
        open={open}
        aria-labelledby="form-dialog-title"
        PaperProps={{ className: styles.paperDialog }}
        onClose={onClose}
      >
        <DialogTitle id="form-dialog-title">{t('admin:components.bot.updateBot')}</DialogTitle>
        <DialogContent>
          <InputText
            name="name"
            label={t('admin:components.bot.name')}
            value={state.name.value}
            error={formErrors.name.value}
            onChange={handleInputChange}
          />

          <InputText
            name="description"
            label={t('admin:components.bot.description')}
            value={state.description.value}
            error={formErrors.description.value}
            onChange={handleInputChange}
          />

          <InputSelect
            name="location"
            label={t('admin:components.bot.location')}
            value={state.location.value}
            error={formErrors.location.value}
            menu={locationsMenu}
            onChange={handleInputChange}
            endControl={
              <IconButton
                onClick={fetchAdminLocations}
                icon={<Icon type="Autorenew" style={{ color: 'var(--iconButtonColor)' }} />}
              />
            }
          />

          <InputSelect
            name="instance"
            label={t('admin:components.bot.instance')}
            value={state.instance.value}
            menu={instancesMenu}
            onChange={handleInputChange}
            endControl={
              <IconButton
                onClick={fetchAdminInstances}
                icon={<Icon type="Autorenew" style={{ color: 'var(--iconButtonColor)' }} />}
              />
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            disableElevation
            type="submit"
            onClick={() => {
              state.set({ name: '', description: '', instance: '', location: '' })
              formErrors.set({ name: '', description: '', location: '' })
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
            <Icon type="Save" style={{ marginRight: '10px' }} /> {t('admin:components.common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default UpdateBot
