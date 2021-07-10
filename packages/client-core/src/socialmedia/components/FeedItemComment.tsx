import React, { useState } from 'react'
import { UsernameText } from './UsernameText'
import { useTranslation } from 'react-i18next'

export function FeedItemComment({ data }: any) {
  const [showMore, setShowMore] = useState(data?.description.length < 80)
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden mx-4 text-14-light inherit">
      <UsernameText username={data.username} />
      <span className={!showMore ? 'feed-item-text-description ' : 'inherit'}>
        {data?.description ||
          'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum'}
      </span>
      {!showMore && (
        <span style={{ color: '#9a9a9a' }} onClick={() => setShowMore(true)}>
          {' '}
          {t('social:more')}
        </span>
      )}
    </div>
  )
}
