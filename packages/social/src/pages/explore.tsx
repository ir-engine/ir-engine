import AppHeader from '@xrengine/social/src/components/Header'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Explore() {
  const { t } = useTranslation()
  return (
    <div className="container">
      <AppHeader />
      <div>{t('explore.title')}</div>
    </div>
  )
}
