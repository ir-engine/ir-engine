import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { BotCommands, CreateBotAsAdmin } from '@xrengine/common/src/interfaces/AdminBot'
import { Instance } from '@xrengine/common/src/interfaces/Instance'

import { Autorenew, Face, Save } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../../user/services/AuthService'
import AddCommand from '../../common/AddCommand'
import AlertMessage from '../../common/AlertMessage'
import { useFetchAdminInstance } from '../../common/hooks/Instance.hooks'
import { useFetchAdminLocations } from '../../common/hooks/Location.hooks'
import InputSelect, { InputSelectProps } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { BotService } from '../../services/BotsService'
import { InstanceService, useInstanceState } from '../../services/InstanceService'
import { LocationService, useLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'

const CreateBot = () => {
  const [command, setCommand] = useState<BotCommands>({
    id: '',
    name: '',
    description: ''
  })
  const [commandData, setCommandData] = useState<BotCommands[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

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
  const adminInstanceState = useInstanceState()
  const authState = useAuthState()
  const user = authState.user
  const adminInstances = adminInstanceState
  const instanceData = adminInstances.instances
  const adminLocationState = useLocationState()
  const adminLocation = adminLocationState
  const locationData = adminLocation.locations
  const { t } = useTranslation()

  //Call custom hooks
  useFetchAdminInstance(user, adminInstanceState, InstanceService)
  useFetchAdminLocations(user, adminLocationState, LocationService)
  AddCommand
  const handleChangeCommand = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setCommand({ ...command, id: uuidv4(), [name]: value })
  }

  const addCommandData = (command) => {
    if (command.name) {
      const found = commandData.find((el) => el.name === command.name)
      if (found) {
        setError(t('admin:components.bot.uniqueCommand'))
        setOpen(true)
      } else {
        setCommandData([...commandData, command])
        setCommand({ id: '', name: '', description: '' })
      }
    } else {
      setError(t('admin:components.bot.commandRequired'))
      setOpen(true)
    }
  }

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
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
    if (validateForm(state, formErrors)) {
      BotService.createBotAsAdmin(data)
      setState({ name: '', description: '', instance: '', location: '' })
      setCommandData([])
      setCurrentIntance([])
    } else {
      setError(t('admin:components.bot.fillRequiredField'))
      setOpen(true)
    }
  }

  const fetchAdminInstances = () => {
    InstanceService.fetchAdminInstances()
  }

  const fetchAdminLocations = () => {
    LocationService.fetchAdminLocations()
  }

  const removeCommand = (id: string) => {
    const data = commandData.filter((el) => el.id !== id)
    setCommandData(data)
  }

  const handleInputChange = (e) => {
    const names = e.target.name
    const value = e.target.value
    let temp = formErrors
    temp[names] = value.length < 2 ? `${_.upperFirst(names)} is required` : ''
    setFormErrors(temp)
    setState({ ...state, [names]: value })
  }

  const locationMenu: InputSelectProps[] = locationData.value.map((el) => {
    return {
      value: el.id,
      label: el.name
    }
  })

  const instanceMenu: InputSelectProps[] = currentInstance.map((el) => {
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
        <form style={{ marginTop: '40px' }}>
          <InputText
            name="name"
            label={t('admin:components.bot.name')}
            handleInputChange={handleInputChange}
            value={state.name}
            error={formErrors.name}
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
            menu={locationMenu}
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
            error={formErrors.location}
            menu={instanceMenu}
            handleInputChange={handleInputChange}
            endControl={
              <IconButton onClick={fetchAdminInstances} size="large">
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
      <AlertMessage open={open} handleClose={handleClose} severity="warning" message={error} />
    </Card>
  )
}

export default CreateBot
