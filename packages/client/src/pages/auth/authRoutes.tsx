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

import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'

import $magiclink from './magiclink'
import $discord from './oauth/discord'
import $facebook from './oauth/facebook'
import $github from './oauth/github'
import $google from './oauth/google'
import $linkedin from './oauth/linkedin'
import $twitter from './oauth/twitter'

const AuthRoutes = () => {
  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.loadingAuth')} />}>
      <Routes>
        <Route path="oauth/discord" element={<$discord />} />
        <Route path="oauth/facebook" element={<$facebook />} />
        <Route path="oauth/github" element={<$github />} />
        <Route path="oauth/google" element={<$google />} />
        <Route path="oauth/linkedin" element={<$linkedin />} />
        <Route path="oauth/twitter" element={<$twitter />} />
        <Route path="magiclink" element={<$magiclink />} />
      </Routes>
    </Suspense>
  )
}

export default AuthRoutes
