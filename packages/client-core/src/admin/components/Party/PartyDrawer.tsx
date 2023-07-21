/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useHookstate } from '@hookstate/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { Party } from '@etherealengine/common/src/interfaces/Party'
import { getMutableState } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'

import { NotificationService } from '../../../common/services/NotificationService'
import { AuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import { validateForm } from '../../common/validation/formValidation'
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

  const user = useHookstate(getMutableState(AuthState)).user.value

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
