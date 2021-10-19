import React, { Fragment, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const Custom404 = (): any => {
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
