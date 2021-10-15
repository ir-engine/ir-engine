import React from 'react'
import { useTranslation } from 'react-i18next'

export const Custom503 = (): any => {
  const { t } = useTranslation()
  return (
    <>
      <h1 style={{ color: 'black' }}>{t('503.msg')}</h1>
      <img src="/static/xrengine black.png" />
    </>
  )
}

export default Custom503
