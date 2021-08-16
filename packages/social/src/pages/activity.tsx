import React from 'react'
import AppHeader from '@xrengine/client-core/src/socialmedia/components/Header'
import { useTranslation } from 'react-i18next'

export default function Activity() {
  const { t } = useTranslation()
  return (
    <div className="container">
      <AppHeader />
      <div>{t('activity.title')}</div>
    </div>
  )
}
