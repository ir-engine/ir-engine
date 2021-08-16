import React from 'react'
import { Box } from './Box'
import { FeedItemHeader } from './FeedItemHeader'
import { FeedItemButtons } from './FeedItemButtons'
import { FeedItemComment } from './FeedItemComment'
import { AddComment } from './AddComment'
import { FeedItemPhotos } from './FeedItemPhotos'
import { useHistory } from 'react-router-dom'
import { ModalStateHook } from './ModalHook'
import { useTranslation } from 'react-i18next'

export function FeedItem({ data }) {
  const { hideModal, setModal } = ModalStateHook()
  const history = useHistory()
  const { t } = useTranslation()

  const moreClickEvent = () => {
    setModal(true, data)
  }
  return (
    <Box className="feed-item-container flex flex-col">
      <FeedItemHeader
        image={data.user.image}
        username={data.user.username}
        data={data}
        moreClickEvent={moreClickEvent}
      />
      <FeedItemPhotos photos={data.photos} />
      <FeedItemButtons className="FeedItemButtons-container w-full h-10 pl-2 pr-2 mt-2 flex items-center" />
      <a href="#" className="feed-item-text text-14-bold mr-1 ml-4">
        {data?.likeCount || '0'} {t('social:likes')}
      </a>
      <FeedItemComment data={{ username: data.user.username, description: data.description }} />
      <a
        className="overflow-hidden mx-4 text-14-light cursor-pointer"
        style={{ color: '#9a9a9a', display: 'flex' }}
        onClick={() => history.push(`/post/${data?.pid || 'post-test'}`)}
      >
        {t('social:viewComments', { count: data?.commentCount || 0 })}
      </a>
      {data.popularComments.map((item: any) => {
        return <FeedItemComment key={item.username} data={{ username: item.username, description: item.description }} />
      })}
      <a
        className="feed-item-date-text cursor-pointer uppercase"
        onClick={() => history.push(`/post/${data?.pid || 'post-test'}`)}
      >
        {data.time}
      </a>
      <AddComment />
    </Box>
  )
}
