import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Messages() {
  const { t } = useTranslation()
  return (
    <div className="container">
      <div>{t('messages.title')}</div>
    </div>
  )
}
