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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'

import { useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { ChannelType, channelPath } from '@etherealengine/engine/src/schemas/social/channel.schema'
import { NotificationService } from '../../../common/services/NotificationService'
import { userHasAccess } from '../../../user/userHasAccess'
import DrawerView from '../../common/DrawerView'
import { validateForm } from '../../common/validation/formValidation'
import styles from '../../styles/admin.module.scss'

export enum ChannelDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: ChannelDrawerMode
  selectedChannel?: ChannelType
  onClose: () => void
}

const defaultState = {
  name: '',
  formErrors: {
    name: ''
  }
}

const ChannelDrawer = ({ open, mode, selectedChannel, onClose }: Props) => {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })

  const hasWriteAccess = userHasAccess('channel:write')
  const viewMode = mode === ChannelDrawerMode.ViewEdit && !editMode

  const channelsMutation = useMutation(channelPath)

  useEffect(() => {
    loadSelectedChannel()
  }, [selectedChannel])

  const loadSelectedChannel = () => {
    if (selectedChannel) {
      setState({
        ...defaultState,
        name: selectedChannel.name ?? 0
      })
    }
  }

  const handleCancel = () => {
    if (editMode) {
      loadSelectedChannel()
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
      case 'name':
        tempErrors.name = value < 2 ? t('admin:components.channel.nameRequired') : ''
        break
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleSubmit = async () => {
    const data = {
      name: state.name
    }

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.channel.nameRequired')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      if (mode === ChannelDrawerMode.Create) {
        await channelsMutation.create({})
      } else if (selectedChannel) {
        await channelsMutation.patch(selectedChannel.id!, data)
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
          {mode === ChannelDrawerMode.Create && t('admin:components.channel.createChannel')}
          {mode === ChannelDrawerMode.ViewEdit &&
            editMode &&
            `${t('admin:components.common.update')} ${selectedChannel?.id}`}
          {mode === ChannelDrawerMode.ViewEdit && !editMode && `${selectedChannel?.id}`}
        </DialogTitle>

        <InputText
          name="name"
          label={t('admin:components.channel.name')}
          value={state.name}
          error={state.formErrors.name}
          disabled={viewMode}
          onChange={handleChange}
        />

        <DialogActions>
          <Button className={styles.outlinedButton} onClick={handleCancel}>
            {t('admin:components.common.cancel')}
          </Button>
          {(mode === ChannelDrawerMode.Create || editMode) && (
            <Button className={styles.gradientButton} onClick={handleSubmit}>
              {t('admin:components.common.submit')}
            </Button>
          )}
          {mode === ChannelDrawerMode.ViewEdit && !editMode && (
            <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => setEditMode(true)}>
              {t('admin:components.common.edit')}
            </Button>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default ChannelDrawer
