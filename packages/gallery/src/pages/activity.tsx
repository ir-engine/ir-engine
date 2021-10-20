import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Activity() {
  const { t } = useTranslation()
  return (
    <div className="container">
      <div>{t('activity.title')}</div>
    </div>
  )
}
