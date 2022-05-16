import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { Dropdown } from 'semantic-ui-react'

import { User } from '@xrengine/common/src/interfaces/User'

import MuiAlert, { AlertProps } from '@mui/material/Alert'
import Grid from '@mui/material/Grid'

import { InviteService } from '../../../social/services/InviteService'
import { InviteTypeService } from '../../../social/services/InviteTypeService'
import { useInviteTypeState } from '../../../social/services/InviteTypeService'
import AutoComplete from '../../common/AutoComplete'
import CreateModal from '../../common/CreateModal'
import InputSelect from '../../common/InputSelect'
import InputText from '../../common/InputText'

interface Props {
  open: boolean
  handleClose: () => void
  users: User[]
}

const inviteCodeRegex = /^[0-9a-fA-F]{8}$/
const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
/**
 * Dev comment: => I don't know use of Token in the form field
 * @param props
 */

const InviteModal = (props: Props) => {
  const { open, handleClose, users } = props
  const router = useHistory()
  const [currency, setCurrency] = useState('friend')
  const inviteTypeData = useInviteTypeState()
  const inviteType = inviteTypeData.inviteTypeData.invitesType?.value
  const [targetUser, setTargetUser] = useState([])
  const [token, setToken] = useState('')
  const [passcode, setPasscode] = useState('')
  const [providerType, setProviderType] = useState('email')
  const [formErrors, setFormErrors] = useState({
    type: '',
    token: '',
    inviteCode: '',
    invitee: '',
    identityProviderType: '',
    targetObjectId: ''
  })
  const { t } = useTranslation()

  interface Currency {
    value: string
    label: string
  }

  const currencies: Currency[] = []

  const provide = [
    {
      value: 'email',
      label: 'E-mail'
    },
    {
      value: 'sms',
      label: 'SMS'
    }
  ]
  const handleTypeChange = (event) => {
    setCurrency(event.target.value)
  }

  const refreshData = () => {
    router.go(0)
  }

  const handleIndentityProviderTypeChange = (event) => {
    setProviderType(event.target.value)
  }

  const handlePasscodeChange = (event) => {
    setPasscode(event.target.value)
  }

  const handleTokenChange = (event) => {
    setToken(event.target.value)
  }

  const createInvite = async () => {
    const data = {
      type: currency,
      token: token, // phone number (10 digital us number) or email
      inviteCode: passcode || null, // Code should range from 0-9 and a-f as well as A-F match to 8 characters
      invitee: targetUser[0], // valid user id
      identityProviderType: providerType, // email or sms
      targetObjectId: targetUser[0]
    }
    if (token && currency && targetUser) {
      await InviteService.sendInvite(data)
      refreshData()
      handleClose()
    }
  }

  if (inviteType != null) {
    inviteType.forEach((el) => {
      currencies.push({
        value: el.type,
        label: el.type
      })
    })
  }

  interface StateOption {
    key: string
    type: string
    value: string
  }

  const userOptions: StateOption[] = []
  users.forEach((el) => {
    userOptions.push({
      key: el.id ?? '',
      type: el.name,
      value: el.id ?? ''
    })
  })

  useEffect(() => {
    const fetchData = async () => {
      await InviteTypeService.retrieveInvites()
    }
    fetchData()
  }, [])

  const onSelectValue = (data) => {
    setTargetUser(data)
  }

  return (
    <CreateModal
      open={open}
      action={t('admin:components.invite.sendInvitation')}
      text="Send Invite"
      submit={createInvite}
      handleClose={handleClose}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <AutoComplete
            scopes={targetUser}
            data={userOptions}
            label={t('admin:components.invite.selectUsers')}
            handleChangeScopeType={onSelectValue}
          />
          {/* <Dropdown
            placeholder="Users"
            fluid
            multiple
            search
            selection
            onChange={onSelectValue}
            onSearchChange={handleInputChange}
            options={userOptions}
          /> */}
        </Grid>
        <Grid item xs={12}>
          <InputText
            name="passcode"
            handleInputChange={handlePasscodeChange}
            value={passcode}
            formErrors={formErrors.inviteCode}
          />
        </Grid>
        <Grid item xs={12}>
          <label> {t('admin:components.invite.targetType')}</label>
          <InputSelect
            formErrors={formErrors.type}
            value={currency}
            handleInputChange={handleTypeChange}
            name="Target Type"
            menu={currencies}
          />
        </Grid>
        <Grid item xs={12}>
          <label> {t('admin:components.invite.identityProviderType')}</label>
          <InputSelect
            formErrors={formErrors.identityProviderType}
            value={providerType}
            handleInputChange={handleIndentityProviderTypeChange}
            name="Provider Type"
            menu={provide}
          />
        </Grid>
        <Grid item xs={12}>
          <InputText
            name="Phone or Email"
            handleInputChange={handleTokenChange}
            value={token}
            formErrors={formErrors.token}
          />
        </Grid>
      </Grid>
    </CreateModal>
  )
}

export default InviteModal
