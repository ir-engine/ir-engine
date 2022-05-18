import React, { Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

export const Custom404 = (): any => {
  console.log('404')
  const router = useHistory()
  const { t } = useTranslation()
  useEffect(() => {
    router.push('/')
  })
  return (
    <Fragment>
      <h1>{t('404.msg')}</h1>
    </Fragment>
  )
}

export default Custom404
