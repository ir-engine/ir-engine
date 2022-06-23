import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Instance } from '@xrengine/common/src/interfaces/Instance'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import { validateForm } from '../../common/validation/formValidation'
import { PartyProps } from '../../common/variables/party'
import { AdminInstanceService } from '../../services/InstanceService'
import { useAdminInstanceState } from '../../services/InstanceService'
import { AdminLocationService } from '../../services/LocationService'
import { useAdminLocationState } from '../../services/LocationService'
import { AdminPartyService } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'

const CreateParty = ({ open, onClose }: PartyProps) => {
  const { t } = useTranslation()

  const [state, setState] = useState({
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

    let temp = { ...state.formErrors }

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
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const data: Instance[] = []
  instanceData.value.forEach((element) => {
    data.push(element)
  })

  const handleSubmit = async () => {
    const data = {
      locationId: state.location,
      instanceId: state.instance
    }

    let tempErrors = {
      ...state.formErrors,
      location: state.location ? '' : t('admin:components.party.locationCantEmpty'),
      instance: state.instance ? '' : t('admin:components.party.instanceCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      await AdminPartyService.createAdminParty(data)
      setState({ ...state, location: '', instance: '' })
      onClose()
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
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{t('admin:components.party.createNewParty')}</DialogTitle>

        <InputSelect
          name="instance"
          label={t('admin:components.party.instance')}
          value={state.instance}
          error={state.formErrors.instance}
          menu={instanceMenu}
          onChange={handleChange}
        />

        <InputSelect
          name="location"
          label={t('admin:components.party.location')}
          value={state.location}
          error={state.formErrors.location}
          menu={locationMenu}
          onChange={handleChange}
        />

        <DialogContentText className={styles.mb15}>
          <span className={styles.spanWhite}>{t('admin:components.party.dontSeeLocation')}</span>
          <a href="/admin/locations" className={styles.textLink}>
            {t('admin:components.party.createOne')}
          </a>
        </DialogContentText>

        <DialogActions>
          <Button className={styles.submitButton} onClick={handleSubmit}>
            {t('admin:components.locationModal.submit')}
          </Button>
          <Button className={styles.cancelButton} onClick={onClose}>
            {t('admin:components.setting.cancel')}
          </Button>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default CreateParty
