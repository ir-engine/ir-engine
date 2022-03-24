import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Instance } from '@xrengine/common/src/interfaces/Instance'

import DialogContentText from '@mui/material/DialogContentText'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'

import { useAuthState } from '../../../user/services/AuthService'
import CreateModal from '../../common/CreateModal'
import { useFetchAdminInstance } from '../../common/hooks/Instance.hooks'
import { useFetchAdminLocations } from '../../common/hooks/Location.hooks'
import { validateForm } from '../../common/validation/formValidation'
import { PartyProps } from '../../common/variables/party'
import { InstanceService } from '../../services/InstanceService'
import { useInstanceState } from '../../services/InstanceService'
import { LocationService } from '../../services/LocationService'
import { useLocationState } from '../../services/LocationService'
import { PartyService } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'

const CreateParty = (props: PartyProps) => {
  CreateParty
  const { open, handleClose } = props
  const { t } = useTranslation()

  const [newParty, setNewParty] = useState({
    location: '',
    instance: '',
    formErrors: {
      location: '',
      instance: ''
    }
  })

  const authState = useAuthState()
  const user = authState.user
  const adminLocationState = useLocationState()
  const locationData = adminLocationState.locations
  const adminInstanceState = useInstanceState()
  const instanceData = adminInstanceState.instances

  //Call custom hooks
  useFetchAdminInstance(user, adminInstanceState, InstanceService)
  useFetchAdminLocations(user, adminLocationState, LocationService)

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = newParty.formErrors
    switch (name) {
      case 'location':
        temp.location = value.length < 2 ? t('admin:components.party.locationRequired') : ''
        break
      case 'instance':
        temp.instance = value.length < 2 ? t('admin:components.party.instanceRequired') : ''
        break

      default:
        break
    }
    setNewParty({ ...newParty, [name]: value, formErrors: temp })
  }

  const data: Instance[] = []
  instanceData.value.forEach((element) => {
    data.push(element)
  })

  const submitParty = async () => {
    const data = {
      locationId: newParty.location,
      instanceId: newParty.instance
    }
    let temp = newParty.formErrors
    if (!newParty.location) {
      temp.location = t('admin:components.party.locationCantEmpty')
    }
    if (!newParty.instance) {
      temp.instance = t('admin:components.party.instanceCantEmpty')
    }
    setNewParty({ ...newParty, formErrors: temp })

    if (validateForm(newParty, newParty.formErrors)) {
      await PartyService.createAdminParty(data)
      setNewParty({ ...newParty, location: '', instance: '' })
      handleClose()
    }
  }
  return (
    <CreateModal open={open} action="Create" text="party" handleClose={handleClose} submit={submitParty}>
      <label>{t('admin:components.party.instance')}</label>
      <Paper
        component="div"
        className={newParty.formErrors.instance.length > 0 ? styles.redBorder : styles.createInput}
      >
        <FormControl fullWidth>
          <Select
            labelId="demo-controlled-open-select-label"
            id="demo-controlled-open-select"
            value={newParty.instance}
            fullWidth
            displayEmpty
            onChange={handleChange}
            className={styles.select}
            name="instance"
            MenuProps={{ classes: { paper: styles.selectPaper } }}
          >
            <MenuItem value="" disabled>
              <em>{t('admin:components.party.selectInstance')}</em>
            </MenuItem>
            {data.map((el) => (
              <MenuItem value={el?.id} key={el?.id}>
                {el?.ipAddress}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <label>{t('admin:components.party.location')}</label>
      <Paper
        component="div"
        className={newParty.formErrors.location.length > 0 ? styles.redBorder : styles.createInput}
      >
        <FormControl fullWidth>
          <Select
            labelId="demo-controlled-open-select-label"
            id="demo-controlled-open-select"
            value={newParty.location}
            fullWidth
            displayEmpty
            onChange={handleChange}
            className={styles.select}
            name="location"
            MenuProps={{ classes: { paper: styles.selectPaper } }}
          >
            <MenuItem value="" disabled>
              <em>{t('admin:components.party.selectLocation')}</em>
            </MenuItem>
            {locationData.value.map((el) => (
              <MenuItem value={el?.id} key={el?.id}>
                {el?.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <DialogContentText className={styles.mb15}>
        <span className={styles.spanWhite}>{t('admin:components.party.dontSeeLocation')}</span>
        <a href="/admin/locations" className={styles.textLink}>
          {t('admin:components.party.createOne')}
        </a>
      </DialogContentText>
    </CreateModal>
  )
}

export default CreateParty
