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

import React, { useEffect, useState } from 'react'

import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { MdErrorOutline } from 'react-icons/md'
import { useLocation } from 'react-router-dom'
import { AuthService, AuthState } from '../../services/AuthService'

interface ErrorPageProps {
  name: string
}

export default function ErrorPage({ name }: ErrorPageProps) {
  const { t } = useTranslation()
  const initialState = { error: '', token: '' }
  const [state, setState] = useState(initialState)
  const search = new URLSearchParams(useLocation().search)
  const showError = useHookstate(false)

  useEffect(() => {
    const error = search.get('error') as string
    const token = search.get('token') as string
    const type = search.get('type') as string
    const path = search.get('path') as string
    const instanceId = search.get('instanceId') as InstanceID

    if (!error) {
      if (type === 'connection') {
        const user = useHookstate(getMutableState(AuthState)).user
        AuthService.refreshConnections(user.id.value!)
      } else {
        let redirectSuccess = `${path}`
        if (instanceId != null) redirectSuccess += `?instanceId=${instanceId}`
        AuthService.loginUserByJwt(token, redirectSuccess || '/', '/')
      }
    }

    setState({ ...state, error, token })
  }, [])

  function redirectToRoot() {
    window.location.href = '/'
  }

  return (
    <div className="pointer-events-auto flex h-full w-full items-center justify-center bg-gray-900 p-2">
      {state.error ? (
        <div className="grid w-full gap-y-3 rounded-md border border-gray-700 bg-gray-800 p-3 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <MdErrorOutline size="4rem" className="w-full text-center text-red-400" />

          <Text fontWeight="bold" fontSize="2xl" className="mt-1 text-center text-white" component="h2">
            {t('user:oauth.error')}
          </Text>

          <Text className="p text-center text-gray-400">{t('user:oauth.authFailed', { name })}</Text>

          <button
            className="flex items-center justify-center rounded border-gray-600 bg-gray-700 p-2 text-gray-200 hover:bg-gray-600 hover:text-gray-100"
            onClick={() => {
              showError.set((v) => !v)
            }}
          >
            <span>
              {t('user:oauth.showError')}
              {showError.value ? (
                <IoIosArrowUp className="inline-block" size="1.25rem" />
              ) : (
                <IoIosArrowDown className="inline-block" size="1.25rem" />
              )}
            </span>
          </button>

          {showError.value && (
            <div className="w-full overflow-x-auto rounded border bg-white p-5 font-mono text-black">
              <code>{JSON.stringify({ error: state.error })}</code>
            </div>
          )}

          <button onClick={redirectToRoot} className="rounded bg-blue-500 p-2 text-white">
            {t('user:oauth.redirectToRoot')}
          </button>
        </div>
      ) : (
        <LoadingView className="h-20 w-20" />
      )}
    </div>
  )
}
