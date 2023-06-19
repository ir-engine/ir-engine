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
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import CardMedia from '@etherealengine/ui/src/primitives/mui/CardMedia'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { useRouter } from '../../../common/services/RouterService'
import { AuthService, AuthState } from '../../services/AuthService'
import styles from '../Login/index.module.scss'

interface Props {
  logo?: string
}

const ConfirmEmail = (props: Props): JSX.Element => {
  const route = useRouter()
  const auth = useHookstate(getMutableState(AuthState))
  const { t } = useTranslation()

  const handleResendEmail = (e: any): any => {
    e.preventDefault()

    const identityProvider = auth.authUser.identityProvider

    AuthService.resendVerificationEmail(identityProvider.token.value)
  }

  return (
    <section className={styles.loginPage}>
      <span className={styles.placeholder} />
      <CardMedia className={styles.logo} image={props.logo} title="ARC Logo" />
      <span className={styles.placeholder} />
      <Typography component="h1" variant="h5" align="center">
        {t('user:auth.confirmEmail.header')}
      </Typography>
      <section className={styles.content}>
        <Typography variant="body2" color="textSecondary" align="center">
          <Trans t={t} i18nKey="user:auth.confirmEmail.resendEmail">
            {t('user:auth.confirmEmail.resendEmail', {
              here: `${(
                <>
                  <Button variant="contained" color="primary" onClick={(e) => handleResendEmail(e)}>
                    here
                  </Button>
                  <br />
                </>
              )}`
            })}
          </Trans>
        </Typography>
      </section>
      <span className={styles.placeholder} />
      <section className={styles.footer}>
        <p>
          <Trans t={t} i18nKey="user:auth.confirmEmail.resendEmail">
            {t('user:auth.confirmEmail.haveAnAccount')}{' '}
            <span onClick={() => route('/')}>{t('user:auth.register.login')}</span>
          </Trans>
        </p>
      </section>
    </section>
  )
}

export default ConfirmEmail
