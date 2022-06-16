import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Instance } from '@xrengine/common/src/interfaces/Instance'

import DialogContentText from '@mui/material/DialogContentText'

import { useAuthState } from '../../../user/services/AuthService'
import CreateModal from '../../common/CreateModal'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import { validateForm } from '../../common/validation/formValidation'
import { PartyProps } from '../../common/variables/party'
import { AdminInstanceService } from '../../services/InstanceService'
import { useAdminInstanceState } from '../../services/InstanceService'
import { AdminLocationService } from '../../services/LocationService'
import { useAdminLocationState } from '../../services/LocationService'
import { AdminPartyService } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'

const CreateParty = ({ open, handleClose }: PartyProps) => {
  CreateParty
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
  const adminLocationState = useAdminLocationState()
  const locationData = adminLocationState.locations
  const adminInstanceState = useAdminInstanceState()
  const instanceData = adminInstanceState.instances

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
      await AdminPartyService.createAdminParty(data)
      setNewParty({ ...newParty, location: '', instance: '' })
      handleClose()
    }
  }

  const instanceMenu: InputMenuItem[] = data.map((el) => {
    return {
      value: el?.id,
      label: el?.ipAddress
    }
  })

  const locationMenu: InputMenuItem[] = locationData.value.map((el) => {
    return {
      value: el?.id,
      label: el?.name
    }
  })

  return (
    <CreateModal open={open} action="Create" text="party" handleClose={handleClose} submit={submitParty}>
      <InputSelect
        name="instance"
        label={t('admin:components.party.instance')}
        value={newParty.instance}
        error={newParty.formErrors.instance}
        menu={instanceMenu}
        onChange={handleChange}
      />

      <InputSelect
        name="location"
        label={t('admin:components.party.location')}
        value={newParty.location}
        error={newParty.formErrors.location}
        menu={locationMenu}
        onChange={handleChange}
      />

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
