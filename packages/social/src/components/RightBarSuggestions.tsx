import React from 'react'
import { SuggestionItem } from './SuggestionItem'
import { useTranslation } from 'react-i18next'

export function RightBarSuggestions({ data }: any) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col">
      <div className="suggestions-header flex" style={{ marginTop: 12 }}>
        <span className="text-14-bold mr-auto" style={{ color: '#8e8e8e' }}>
          {t('social:suggestions')}
        </span>
        <a href="#" className="text-12-bold">
          {t('social:seeAll')}
        </a>
      </div>
      <div className="RightBarSuggestions" style={{ paddingBottom: 8, paddingTop: 8 }}>
        {data.map((item: any) => {
          return <SuggestionItem data={item} key={item.username} />
        })}
      </div>
    </div>
  )
}
