/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { config } from '@ir-engine/common/src/config'
import { InstanceID } from '@ir-engine/common/src/schema.type.module'

import Button from '@ir-engine/ui/src/primitives/mui/Button'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { BsFillExclamationTriangleFill } from 'react-icons/bs'
import { AuthService } from '../../services/AuthService'

const AuthMagicLink = (): JSX.Element => {
  const { t } = useTranslation()

  const search = new URLSearchParams(useLocation().search)
  const token = search.get('token') as string
  const type = search.get('type') as string
  const path = search.get('path') as string
  const instanceId = search.get('instanceId') as InstanceID
  const promptForConnection = search.get('promptForConnection') as string
  const loginId = search.get('loginId') as string
  const loginToken = search.get('loginToken') as string
  const email = search.get('associateEmail') as string

  useEffect(() => {
    if (type === 'login') {
      let redirectSuccess = path ? `${path}` : null
      if (redirectSuccess && instanceId != null)
        redirectSuccess += redirectSuccess.indexOf('?') > -1 ? `&instanceId=${instanceId}` : `?instanceId=${instanceId}`
      AuthService.loginUserByJwt(token, redirectSuccess || '/', '/')
    } else if (type === 'connection') {
      AuthService.loginUserMagicLink(token, '/', '/')
    }
  }, [])

  function doRedirect(connect = false) {
    let redirect = /https:\/\//.test(path) ? path : path ? config.client.clientUrl + path : config.client.clientUrl
    if (instanceId != null) redirect += `?instanceId=${instanceId}`
    window.location.href = `${
      config.client.serverUrl
    }/login/${loginId}?token=${loginToken}&redirectUrl=${redirect}&associate=${connect.toString()}`
  }

  return (
    <div className="pointer-events-auto flex h-full w-full items-center justify-center bg-[#080808] p-2">
      {promptForConnection === 'true' ? (
        <div className="grid w-full gap-y-3 rounded-xl bg-[#0E0F11] p-3 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <div className="flex flex-col items-center py-6 text-white">
            <div className="mb-8 h-14 w-14 rounded-full bg-[#191B1F]">
              <BsFillExclamationTriangleFill className="mx-auto my-3 h-6 w-6 text-white" />
            </div>

            <Text fontWeight="medium" fontSize="xl">
              {t('user:magicLink.promptForConnection')}
            </Text>

            <Text className="py-2 opacity-50" fontWeight="medium" fontSize="sm">
              {t('user:magicLink.askConnection', { email: email })}
            </Text>

            <div className="flex">
              <Button onClick={() => doRedirect(true)}>{t('user:magicLink.acceptConnection')}</Button>

              <Button onClick={() => doRedirect(false)}>{t('user:magicLink.declineConnection')}</Button>
            </div>
          </div>
        </div>
      ) : (
        <LoadingView
          fullScreen
          title={t('common:loader.authenticating')}
          titleClassname="text-white"
          className="block h-12 w-12"
        />
      )}
    </div>
  )

  // return promptForConnection === 'true' ? (
  //   <Container style={{ "pointer-events": "auto" }}>
  //     <div>{t('user:magicLink.promptForConnection')}</div>
  //     <div >{t('user:magicLink.askConnection', { email: email })}</div>
  //     <div className="flex">
  //       <Button onClick={() => doRedirect(true)} style={{ color: 'primary' }} >
  //         {t('user:magicLink.acceptConnection')}
  //       </Button>
  //       <Button onClick={() => doRedirect(false)}>
  //         {t('user:magicLink.declineConnection')}
  //       </Button>
  //     </div>
  //   </Container>
  // ) : (
  //   <Container component="main" maxWidth="md">
  //     <Box mt={3}>
  //       <Typography variant="body2" color="textSecondary" align="center">
  //         {t('user:magicLink.wait')}
  //       </Typography>
  //     </Box>
  //   </Container>
  // )
}

export default AuthMagicLink
