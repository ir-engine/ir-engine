import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

export const Custom404 = (): any => {
  const { t } = useTranslation()
  return (
    <Fragment>
      <h1>{t('404.msg')}</h1>
    </Fragment>
  )
}

export default Custom404
