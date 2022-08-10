import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { BotCommands, CreateBotAsAdmin } from '@xrengine/common/src/interfaces/AdminBot'
import { Instance } from '@xrengine/common/src/interfaces/Instance'
import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'

import { Autorenew, Face, Save } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import AddCommand from '../../common/AddCommand'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminBotService } from '../../services/BotsService'
import { AdminInstanceService, useAdminInstanceState } from '../../services/InstanceService'
import { AdminLocationService, useAdminLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'

const CreateBot = () => {
  const [command, setCommand] = useState<BotCommands>({
    id: '',
    name: '',
    description: ''
  })
  const [commandData, setCommandData] = useState<BotCommands[]>([])

  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    location: ''
  })
  const [currentInstance, setCurrentIntance] = useState<Instance[]>([])
  const [state, setState] = useState({
    name: '',
    description: '',
    instance: '',
    location: ''
  })
  const adminInstanceState = useAdminInstanceState()
  const authState = useAuthState()
  const user = authState.user
  const adminInstances = adminInstanceState
  const instanceData = adminInstances.instances
  const adminLocationState = useAdminLocationState()
  const adminLocation = adminLocationState
  const locationData = adminLocation.locations
  const { t } = useTranslation()

  useEffect(() => {
    if (user?.id.value && adminInstanceState.updateNeeded.value) {
      AdminInstanceService.fetchAdminInstances()
    }
  }, [user?.id?.value, adminInstanceState.updateNeeded.value])

  useEffect(() => {
    if (user?.id.value && adminLocationState.updateNeeded.value) {
      AdminLocationService.fetchAdminLocations()
    }
  }, [user?.id?.value, adminLocationState.updateNeeded.value])

  const handleChangeCommand = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setCommand({ ...command, id: uuidv4(), [name]: value })
  }

  const addCommandData = (command) => {
    if (command.name) {
      const found = commandData.find((el) => el.name === command.name)
      if (found) {
        NotificationService.dispatchNotify(t('admin:components.bot.uniqueCommand'), { variant: 'error' })
      } else {
        setCommandData([...commandData, command])
        setCommand({ id: '', name: '', description: '' })
      }
    } else {
      NotificationService.dispatchNotify(t('admin:components.bot.commandRequired'), { variant: 'error' })
    }
  }

  const data: Instance[] = instanceData.value.map((element) => {
    return element
  })

  useEffect(() => {
    const instanceFilter = data.filter((el) => el.locationId === state.location)
    if (instanceFilter.length > 0) {
      setState({ ...state, instance: '' })
      setCurrentIntance(instanceFilter)
    } else {
      setCurrentIntance([])
    }
  }, [state.location, adminInstanceState.instances.value.length])

  const handleSubmit = () => {
    const data: CreateBotAsAdmin = {
      name: state.name,
      instanceId: state.instance || null,
      userId: user.id.value,
      command: commandData,
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

    if (validateForm(state, tempErrors)) {
      AdminBotService.createBotAsAdmin(data)
      setState({ name: '', description: '', instance: '', location: '' })
      setCommandData([])
      setCurrentIntance([])
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

  const removeCommand = (id: string) => {
    const data = commandData.filter((el) => el.id !== id)
    setCommandData(data)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    let temp = { ...formErrors }
    temp[name] = value.length < 2 ? `${capitalizeFirstLetter(name)} is required` : ''
    setFormErrors(temp)
    setState({ ...state, [name]: value })
  }

  const locationMenu: InputMenuItem[] = locationData.value.map((el) => {
    return {
      value: el.id,
      label: el.name
    }
  })

  const instanceMenu: InputMenuItem[] = currentInstance.map((el) => {
    return {
      value: el.id,
      label: el.ipAddress
    }
  })

  return (
    <Card className={styles.botRootLeft}>
      <Paper className={styles.botHeader} style={{ display: 'flex' }}>
        <Typography className={styles.botTitle}>
          <Face />
          <div className={styles.smFont}>{t('admin:components.bot.createNewBot')}</div>
        </Typography>

        <Button variant="contained" disableElevation type="submit" className={styles.botSaveBtn} onClick={handleSubmit}>
          <Save className={styles.saveBtnIcon} /> {t('social:save')}
        </Button>
      </Paper>
      <CardContent>
        <Typography className={styles.secondaryHeading} component="h1">
          {t('admin:components.bot.addMoreBots')}
        </Typography>
        <form style={{ marginTop: '20px' }}>
          <InputText
            name="name"
            label={t('admin:components.bot.name')}
            onChange={handleInputChange}
            value={state.name}
            error={formErrors.name}
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
            menu={locationMenu}
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
            error={formErrors.location}
            menu={instanceMenu}
            onChange={handleInputChange}
            endControl={
              <IconButton onClick={fetchAdminInstances}>
                <Autorenew style={{ color: 'var(--iconButtonColor)' }} />
              </IconButton>
            }
          />

          <AddCommand
            command={command}
            handleChangeCommand={handleChangeCommand}
            addCommandData={addCommandData}
            commandData={commandData}
            removeCommand={removeCommand}
          />
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateBot
