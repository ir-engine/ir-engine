/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '@xrengine/client-core/src/store'

import { Typography } from '@mui/material'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import VisibilityIcon from '@mui/icons-material/Visibility'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import FavoriteIcon from '@mui/icons-material/Favorite'
import InfiniteScroll from 'react-infinite-scroll-component'

import WrapForVideo from './WrapForVideo'
import { useHistory } from 'react-router-dom'
import styles from './Featured.module.scss'

const Featured = ({ thisData, targetBody, containerId }: any) => {
  const { t } = useTranslation()
  const history = useHistory()
  const [sliceValues, setSliceValues] = useState([-8])
  const [thisFakeLength, setThisFakeLength] = useState(8)

  const showNextData = () => {
    setSliceValues([sliceValues[0] - 8])
    const newFakeLength = 1 * thisFakeLength + 8
    setThisFakeLength(newFakeLength < thisData.length ? newFakeLength : thisData.length)
  }

  const goTooFeed = (id) => {
    history.push(`/feed/${id}`)
  }

  const infiniteScrollProps: any = {}
  if (!targetBody) {
    const wrapScroll = document.getElementById(containerId)
    if (wrapScroll === null) return null
    infiniteScrollProps.scrollableTarget = wrapScroll
  }

  return (
    <>
      {thisData && thisData.length > 0 ? (
        <InfiniteScroll
          {...infiniteScrollProps}
          dataLength={thisFakeLength}
          next={showNextData}
          hasMore={true}
          loader={null}
          className={styles.feedContainer}
        >
          {thisData
            .slice(...sliceValues)
            .reverse()
            .map((item, itemIndex) => {
              const sizeIndex =
                itemIndex === 0 || itemIndex % 8 === 0 || itemIndex % 8 === 2 || itemIndex % 8 === 5
                  ? 'listItem_width2'
                  : itemIndex % 8 === 1
                  ? 'listItem_width3'
                  : 'listItem_width1'
              const topIndex = itemIndex % 8 === 2 ? 'listItem_top1' : itemIndex % 8 === 5 ? 'listItem_top2' : ''
              const width1_no_right_padding =
                itemIndex % 8 === 4 || itemIndex % 8 === 7 ? 'width1_no_right_padding' : ''
              return (
                <Card
                  className={
                    styles.creatorItem +
                    ' ' +
                    styles[sizeIndex] +
                    ' ' +
                    styles[topIndex] +
                    ' ' +
                    styles[width1_no_right_padding]
                  }
                  elevation={0}
                  key={item.id}
                >
                  {/* {renderFeaturedStar( item.id, item.creatorId, !!+item.featured)} */}
                  <WrapForVideo>
                    <CardMedia
                      {...{ ['data-src']: item.previewUrl }}
                      id={item.id}
                      className={styles.previewImage}
                      component="video"
                      loop
                      autoPlay
                      muted
                      playsInline
                      onClick={() => goTooFeed(item.id)}
                      style={{
                        objectFit: 'cover'
                      }}
                    />
                  </WrapForVideo>
                  <span className={styles.eyeLine}>
                    {item.viewsCount}
                    <VisibilityIcon style={{ fontSize: '16px' }} />
                  </span>
                  <span className={styles.fireLine}>
                    {item.fires}
                    <WhatshotIcon style={{ fontSize: '16px' }} />
                  </span>
                  <span className={styles.favoriteLine}>
                    {item.likes}
                    <FavoriteIcon style={{ fontSize: '16px' }} />
                  </span>
                </Card>
              )
            })}
        </InfiniteScroll>
      ) : (
        <Typography className={styles.emptyList}>{t('social:featured.empty-list')}</Typography>
      )}
    </>
  )
}

export default Featured
