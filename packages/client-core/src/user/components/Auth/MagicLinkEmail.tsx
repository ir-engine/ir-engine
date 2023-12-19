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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import FormControlLabel from '@etherealengine/ui/src/primitives/mui/FormControlLabel'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import TextField from '@etherealengine/ui/src/primitives/mui/TextField'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { authenticationSettingPath } from '@etherealengine/engine/src/schemas/setting/authentication-setting.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { initialAuthState } from '../../../common/initialAuthState'
import config from '../../../config'
import { AuthService, AuthState } from '../../services/AuthService'
import styles from './index.module.scss'

interface Props {
  type?: 'email' | 'sms' | undefined
  isAddConnection?: boolean
}

const defaultState = {
  emailPhone: '',
  isSubmitted: false,
  isAgreedTermsOfService: false,
  label: '',
  descr: ''
}

const termsOfService = config.client.tosAddress ?? '/terms-of-service'

const MagicLinkEmail = ({ type, isAddConnection }: Props): JSX.Element => {
  const auth = useHookstate(getMutableState(AuthState))
  const state = useHookstate(defaultState)
  const { t } = useTranslation()
  const authSetting = useFind(authenticationSettingPath).data.at(0)
  const authState = useHookstate(initialAuthState)

  useEffect(() => {
    if (authSetting) {
      const temp = { ...initialAuthState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      authState.set(temp)
    }
  }, [authSetting])

  const handleInput = (e: any): void => {
    state.set({ ...state.value, [e.target.name]: e.target.value })
  }

  const handleCheck = (e: any): void => {
    state.set({ ...state.value, [e.target.name]: e.target.checked })
  }

  const handleSubmit = (e: any): void => {
    e.preventDefault()
    if (!isAddConnection) {
      AuthService.createMagicLink(state.emailPhone.value, authState.value)
      state.set({ ...state.value, isSubmitted: true })
      return
    }

    const user = auth.user
    const userId = user ? user.id.value : ('' as UserID)
    if (type === 'email') {
      AuthService.addConnectionByEmail(state.emailPhone.value, userId)
    } else {
      AuthService.addConnectionBySms(state.emailPhone.value, userId)
    }
  }
  let descr = ''
  let label = ''

  useEffect(() => {
    // Pass in a type
    if (type === 'email') {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
      return
    } else if (type === 'sms') {
      descr = t('user:auth.magiklink.descriptionSMS')
      label = t('user:auth.magiklink.lbl-phone')
      return
    } else if (!authSetting) {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
      return
    }
    // Auth config is using Sms and Email, so handle both
    if (authState?.value?.emailMagicLink && authState?.value?.smsMagicLink && !type) {
      descr = t('user:auth.magiklink.descriptionEmailSMS')
      label = t('user:auth.magiklink.lbl-emailPhone')
    } else if (authState?.value?.smsMagicLink) {
      descr = t('user:auth.magiklink.descriptionSMSUS')
      label = t('user:auth.magiklink.lbl-phone')
    } else {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
    }

    state.set({ ...state.value, label: label, descr: descr })
  }, [])

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          {t('user:auth.magiklink.header')}
        </Typography>

        <Typography variant="body2" color="textSecondary" align="center">
          {state.descr.value}
        </Typography>

        <form className={styles.form} noValidate onSubmit={(e) => handleSubmit(e)}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="emailPhone"
                label={state.label.value}
                name="emailPhone"
                // autoComplete="email"
                autoFocus
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    value={true}
                    onChange={(e) => handleCheck(e)}
                    color="primary"
                    name="isAgreedTermsOfService"
                  />
                }
                label={
                  <div className={styles.termsLink}>
                    {t('user:auth.magiklink.agree')}
                    <Link to={termsOfService}>{t('user:auth.magiklink.terms')}</Link>
                  </div>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={styles.submit}
                disabled={!state.isAgreedTermsOfService.value}
              >
                {t('user:auth.magiklink.lbl-submit')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

export default MagicLinkEmail
