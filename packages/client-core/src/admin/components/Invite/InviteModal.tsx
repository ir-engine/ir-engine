import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { User } from '@xrengine/common/src/interfaces/User'

import Grid from '@mui/material/Grid'

import { AlertService } from '../../../common/services/AlertService'
import { InviteService } from '../../../social/services/InviteService'
import { InviteTypeService } from '../../../social/services/InviteTypeService'
import { useInviteTypeState } from '../../../social/services/InviteTypeService'
import AutoComplete from '../../common/AutoComplete'
import CreateModal from '../../common/CreateModal'
import InputSelect from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'

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
  const [currency, setCurrency] = useState('friend')
  const inviteTypeData = useInviteTypeState()
  const inviteType = inviteTypeData?.invitesType
  const [targetUser, setTargetUser] = useState<any>([])
  const [token, setToken] = useState('')
  const [passcode, setPasscode] = useState('')
  const [providerType, setProviderType] = useState('email')
  const [formErrors, setFormErrors] = useState({
    type: '',
    token: '',
    inviteCode: '',
    identityProviderType: ''
  })
  const { t } = useTranslation()

  interface Currency {
    value: string
    label: string
  }

  const currencies: Currency[] = []

  if (inviteType?.value?.length > 0) {
    for (let el of inviteType.value) {
      currencies.push({
        value: el.type,
        label: el.type
      })
    }
  }

  const providers = [
    {
      value: 'email',
      label: 'E-mail'
    },
    {
      value: 'sms',
      label: 'SMS'
    }
  ]

  const resetValues = () => {
    setCurrency('friend')
    setTargetUser([])
    setToken('')
    setPasscode('')
    setProviderType('email')
    setFormErrors({
      type: '',
      token: '',
      inviteCode: '',
      identityProviderType: ''
    })
  }

  const handleTypeChange = (event) => {
    setCurrency(event.target.value)
    formErrors.type.length > 0 &&
      setFormErrors({
        ...formErrors,
        type: event.target.value.length > 0 ? '' : 'This field is required'
      })
  }

  const handleIndentityProviderTypeChange = (event) => {
    setProviderType(event.target.value)
    formErrors.identityProviderType.length > 0 &&
      setFormErrors({
        ...formErrors,
        identityProviderType: event.target.value.length > 0 ? '' : 'This field is required'
      })
  }

  const handlePasscodeChange = (event) => {
    setPasscode(event.target.value)
    formErrors.inviteCode.length > 0 &&
      setFormErrors({
        ...formErrors,
        inviteCode: inviteCodeRegex.test(event.target.value) ? '' : 'Enter valid passcode'
      })
  }

  const handleTokenChange = (event) => {
    setToken(event.target.value)
    formErrors.token.length > 0 &&
      setFormErrors({
        ...formErrors,
        token:
          providerType.length > 0
            ? providerType === 'email'
              ? emailRegex.test(event.target.value)
                ? ''
                : 'Enter valid email'
              : phoneRegex.test(event.target.value)
              ? ''
              : 'Enter valid phone number'
            : 'Select Provider Type first'
      })
  }

  const validateFormErrors = () => {
    setFormErrors({
      ...formErrors,
      type: currency.length > 0 ? '' : 'This field is required',
      inviteCode: inviteCodeRegex.test(passcode) ? '' : 'Enter valid passcode',
      identityProviderType: providerType.length > 0 ? '' : 'This field is required',
      token:
        providerType.length > 0
          ? providerType === 'email'
            ? emailRegex.test(token)
              ? ''
              : 'Enter valid email'
            : phoneRegex.test(token)
            ? ''
            : 'Enter valid phone number'
          : 'Select Provider Type first'
    })
  }

  const createInvite = async () => {
    validateFormErrors()

    if (
      validateForm(
        { type: currency, token: token, inviteCode: passcode || null, identityProviderType: providerType },
        formErrors
      ) &&
      targetUser?.length > 0
    ) {
      for (let tUser of targetUser) {
        const data = {
          type: currency,
          token: token,
          inviteCode: passcode || null,
          invitee: tUser.id,
          identityProviderType: providerType,
          targetObjectId: tUser.id
        }

        await InviteService.sendInvite(data)
      }

      handleClose()
      resetValues()
    } else {
      AlertService.alertError('Select atleast one user and fill all fields.')
    }
  }

  interface StateOption {
    key: string
    name: string
    type: string
    value: string
  }

  const userOptions: StateOption[] = []

  for (let el of users) {
    userOptions.push({
      key: el.id ?? '',
      name: el.name,
      type: el.name,
      value: el.id ?? ''
    })
  }

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
            menu={providers}
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
