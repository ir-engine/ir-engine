import AppHeader from '@xrengine/client-core/src/socialmedia/components/Header'
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
