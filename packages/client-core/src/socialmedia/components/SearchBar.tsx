import React from 'react'
import { useTranslation } from 'react-i18next'

export function SearchBar() {
  const { t } = useTranslation()
  return (
    <div className="search-bar hidden md:flex items-center justify-center ml-auto">
      <input className="search-input" placeholder={t('social:ara')} />
    </div>
  )
}
