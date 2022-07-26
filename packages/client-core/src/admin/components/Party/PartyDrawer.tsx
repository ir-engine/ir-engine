import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Party } from '@xrengine/common/src/interfaces/Party'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminInstanceService } from '../../services/InstanceService'
import { useAdminInstanceState } from '../../services/InstanceService'
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
  selectedParty?: Party
  onClose: () => void
}

const defaultState = {
  maxMembers: 10,
  formErrors: {
    maxMembers: ''
  }
}

const PartyDrawer = ({ open, mode, selectedParty, onClose }: Props) => {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })

  const { user } = useAuthState().value

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'party:write')
  const viewMode = mode === PartyDrawerMode.ViewEdit && !editMode

  useEffect(() => {
    loadSelectedParty()
  }, [selectedParty])

  const loadSelectedParty = () => {
    if (selectedParty) {
      setState({
        ...defaultState,
        maxMembers: selectedParty.maxMembers ?? 0
      })
    }
  }

  const handleCancel = () => {
    if (editMode) {
      loadSelectedParty()
      setEditMode(false)
    } else handleClose()
  }

  const handleClose = () => {
    onClose()
    setState({ ...defaultState })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'maxMembers':
        tempErrors.maxMembers = value < 2 ? t('admin:components.party.maxMembersRequired') : ''
        break
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleSubmit = async () => {
    const data = {
      maxMembers: state.maxMembers
    }

    let tempErrors = {
      ...state.formErrors,
      maxMembers: state.maxMembers ? '' : t('admin:components.party.maxMembersRequired')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      if (mode === PartyDrawerMode.Create) {
        await AdminPartyService.createAdminParty(data)
      } else if (selectedParty) {
        await AdminPartyService.patchParty(selectedParty.id!, data)
        setEditMode(false)
      }

      handleClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
    }
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>
          {mode === PartyDrawerMode.Create && t('admin:components.party.createParty')}
          {mode === PartyDrawerMode.ViewEdit &&
            editMode &&
            `${t('admin:components.common.update')} ${selectedParty?.id}`}
          {mode === PartyDrawerMode.ViewEdit && !editMode && `${selectedParty?.id}`}
        </DialogTitle>

        <InputText
          name="maxMembers"
          label={t('admin:components.party.maxMembers')}
          value={state.maxMembers}
          error={state.formErrors.maxMembers}
          disabled={viewMode}
          onChange={handleChange}
        />

        <DialogActions>
          <Button className={styles.outlinedButton} onClick={handleCancel}>
            {t('admin:components.common.cancel')}
          </Button>
          {(mode === PartyDrawerMode.Create || editMode) && (
            <Button className={styles.gradientButton} onClick={handleSubmit}>
              {t('admin:components.common.submit')}
            </Button>
          )}
          {mode === PartyDrawerMode.ViewEdit && !editMode && (
            <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => setEditMode(true)}>
              {t('admin:components.common.edit')}
            </Button>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default PartyDrawer
