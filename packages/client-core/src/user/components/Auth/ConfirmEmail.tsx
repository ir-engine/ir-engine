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
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { getMutableState } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { AuthService, AuthState } from '../../services/AuthService'
import styles from './index.module.scss'

const ConfirmEmail = (): JSX.Element => {
  const auth = useHookstate(getMutableState(AuthState))
  const { t } = useTranslation()
  const handleResendEmail = (e: any): any => {
    e.preventDefault()

    const identityProvider = auth.authUser.identityProvider

    AuthService.resendVerificationEmail(identityProvider.token.value)
  }

  return (
    <Container component="main" maxWidth="md">
      <div className={styles.paper}>
        <Typography component="h1" variant="h5">
          {t('user:auth.confirmEmail.header')}
        </Typography>
        <Box mt={3}>
          <Typography variant="body2" color="textSecondary" align="center">
            <Trans t={t} i18nKey="user:auth.confirmEmail.resendEmail">
              {t('user:auth.confirmEmail.resendEmail', {
                here: `${(
                  <Button variant="contained" color="primary" onClick={(e) => handleResendEmail(e)}>
                    here
                  </Button>
                )}`
              })}
            </Trans>
          </Typography>
        </Box>
      </div>
    </Container>
  )
}

export default ConfirmEmail
