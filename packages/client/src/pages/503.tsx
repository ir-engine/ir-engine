import React from 'react'
import { useTranslation } from 'react-i18next'

export const Custom503 = (): any => {
  const { t } = useTranslation()
  return <h1 style={{ color: 'black' }}>{t('503.msg')}</h1>
}

export default Custom503
