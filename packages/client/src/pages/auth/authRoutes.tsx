import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'

import $confirm from './confirm'
import $forgotpassword from './forgotpassword'
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
        <Route path="confirm" element={<$confirm />} />
        <Route path="forgotpassword" element={<$forgotpassword />} />
        <Route path="magiclink" element={<$magiclink />} />
      </Routes>
    </Suspense>
  )
}

export default AuthRoutes
