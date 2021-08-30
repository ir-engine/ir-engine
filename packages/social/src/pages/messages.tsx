import React from 'react'
import AppHeader from '@xrengine/social/src/components/Header'
import { useTranslation } from 'react-i18next'

export default function Messages() {
  const { t } = useTranslation()
  return (
    <div className="container">
      <AppHeader />
      <div>{t('messages.title')}</div>
    </div>
  )
}
