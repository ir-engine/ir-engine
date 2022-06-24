import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Party } from '@xrengine/common/src/interfaces/Party'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import { validateForm } from '../../common/validation/formValidation'
import { AdminInstanceService } from '../../services/InstanceService'
import { useAdminInstanceState } from '../../services/InstanceService'
import { AdminLocationService } from '../../services/LocationService'
import { useAdminLocationState } from '../../services/LocationService'
import { AdminPartyService } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'

export enum PartyDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: PartyDrawerMode
  party?: Party
  onClose: () => void
}

const defaultState = {
  location: '',
  instance: '',
  formErrors: {
    location: '',
    instance: ''
  }
}

const PartyDrawer = ({ open, mode, party, onClose }: Props) => {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })

  const { user } = useAuthState().value
  const adminLocationState = useAdminLocationState().value
  const locationData = adminLocationState.locations
  const adminInstanceState = useAdminInstanceState().value
  const instanceData = adminInstanceState.instances

  const hasWriteAccess = user?.scopes && user?.scopes.find((item) => item.type === 'party:write')
  const viewMode = mode === PartyDrawerMode.ViewEdit && editMode === false

  const instanceMenu: InputMenuItem[] = instanceData.map((el) => {
    return {
      value: el?.id,
      label: el?.ipAddress
    }
  })

  const locationMenu: InputMenuItem[] = locationData.map((el) => {
    return {
      value: el?.id,
      label: el?.name
    }
  })

  if (party) {
    const instanceExists = instanceMenu.find((item) => item.value === party?.instance?.id)
    if (!instanceExists) {
      instanceMenu.push({
        value: party?.instance?.id!,
        label: party?.instance?.ipAddress!
      })
    }

    const locationExists = locationMenu.find((item) => item.value === party?.location?.id)
    if (!locationExists) {
      locationMenu.push({
        value: party?.location?.id!,
        label: party?.location?.name!
      })
    }
  }

  useEffect(() => {
    AdminLocationService.fetchAdminLocations()
    AdminInstanceService.fetchAdminInstances()
  }, [])

  useEffect(() => {
    loadParty()
  }, [party])

  const loadParty = () => {
    if (party) {
      setState({
        ...defaultState,
        instance: party?.instance?.id ?? '',
        location: party?.location?.id ?? ''
      })
    }
  }

  const handleClose = () => {
    onClose()
    setState({ ...defaultState })
  }

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
      if (mode === PartyDrawerMode.Create) {
        await AdminPartyService.createAdminParty(data)
      } else if (party) {
        await AdminPartyService.patchParty(party.id!, data)
        setEditMode(false)
      }

      handleClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.locationModal.fillRequiredFields'), { variant: 'error' })
    }
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>
          {mode === PartyDrawerMode.Create && t('admin:components.locationModal.createParty')}
          {mode === PartyDrawerMode.ViewEdit &&
            editMode &&
            `${t('admin:components.locationModal.update')} ${party?.location?.name}/${party?.instance?.ipAddress}`}
          {mode === PartyDrawerMode.ViewEdit && !editMode && `${party?.location?.name}/${party?.instance?.ipAddress}`}
        </DialogTitle>

        <InputSelect
          name="instance"
          label={t('admin:components.party.instance')}
          value={state.instance}
          error={state.formErrors.instance}
          menu={instanceMenu}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputSelect
          name="location"
          label={t('admin:components.party.location')}
          value={state.location}
          error={state.formErrors.location}
          menu={locationMenu}
          disabled={viewMode}
          onChange={handleChange}
        />

        {viewMode === false && (
          <DialogContentText className={styles.mb15}>
            <span className={styles.spanWhite}>{t('admin:components.party.dontSeeLocation')}</span>
            <a href="/admin/locations" className={styles.textLink}>
              {t('admin:components.party.createOne')}
            </a>
          </DialogContentText>
        )}

        <DialogActions>
          {(mode === PartyDrawerMode.Create || editMode) && (
            <Button className={styles.submitButton} onClick={handleSubmit}>
              {t('admin:components.common.submit')}
            </Button>
          )}
          {mode === PartyDrawerMode.ViewEdit && editMode === false && (
            <Button
              className={styles.submitButton}
              disabled={hasWriteAccess ? false : true}
              onClick={() => setEditMode(true)}
            >
              {t('admin:components.common.edit')}
            </Button>
          )}
          <Button
            className={styles.cancelButton}
            onClick={() => {
              if (editMode) {
                loadParty()
                setEditMode(false)
              } else handleClose()
            }}
          >
            {t('admin:components.common.cancel')}
          </Button>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default PartyDrawer
