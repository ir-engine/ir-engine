/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>, Gleb Ordinsky
 */
import { Plugins } from '@capacitor/core'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import TelegramIcon from '@mui/icons-material/Telegram'
import VisibilityIcon from '@mui/icons-material/Visibility'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { Feed } from '@xrengine/common/src/interfaces/Feed'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '@xrengine/client-core/src/store'

import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
import { TheFeedsFiresService } from '@xrengine/client-core/src/social/services/TheFeedsFiresService'
import CreatorAsTitle from '../CreatorAsTitle'
import styles from './TheFeedsCard.module.scss'

const { Share } = Plugins

interface Props {
  feed: Feed
}
const TheFeedsCard = (props: Props): any => {
  const [buttonPopup, setButtonPopup] = useState(false)
  const [fired, setFired] = useState(false)
  const { feed } = props
  const [firedCount, setFiredCount] = useState(feed.fires)
  const dispatch = useDispatch()
  const [thefeedsFiresCreators, setThefeedsFiresCreators] = useState(null)

  const handleAddFireClick = (feedId) => {
    TheFeedsFiresService.addFireToTheFeeds(feedId)
    setFiredCount(firedCount + 1)
    setFired(true)
  }
  const handleRemoveFireClick = (feedId) => {
    TheFeedsFiresService.removeFireToTheFeeds(feedId)
    setFiredCount(firedCount - 1)
    setFired(false)
  }

  useEffect(() => {
    TheFeedsFiresService.getTheFeedsFires(feed.id, setThefeedsFiresCreators)
  }, [])

  const { t } = useTranslation()
  const shareVia = () => {
    Share.share({
      title: t('social:shareForm.arcMedia'),
      text: t('social:shareForm.videoCreated'),
      url: encodeURI(feed.videoUrl),
      dialogTitle: t('social:shareForm.shareWithBuddies')
    })
  }

  const creatorId = useCreatorState().creators.currentCreator?.id?.value

  useEffect(() => {
    setFired(!!thefeedsFiresCreators?.data.find((i) => i.id === creatorId))
  }, [thefeedsFiresCreators])

  return feed ? (
    <>
      <Card className={styles.tipItem} square={false} elevation={0} key={feed.id}>
        {feed.videoUrl ? (
          <CardMedia
            className={styles.previewImage}
            component="video"
            src={feed.videoUrl}
            title={feed.title}
            controls
          />
        ) : (
          ''
        )}
        <span className={styles.eyeLine}>
          {feed.viewsCount}
          <VisibilityIcon style={{ fontSize: '16px' }} />
        </span>
        <CardContent className={styles.cardContent}>
          <section className={styles.iconsContainer}>
            <Typography className={styles.titleContainer} gutterBottom variant="h4">
              {feed.title}
            </Typography>
            <CreatorAsTitle creator={feed.creator} />
            <section className={styles.iconSubContainer}>
              {fired ? (
                <WhatshotIcon
                  className={styles.fireIcon}
                  htmlColor="#FF6201"
                  onClick={() => handleRemoveFireClick(feed.id)}
                />
              ) : (
                <WhatshotIcon
                  className={styles.fireIcon}
                  htmlColor="#DDDDDD"
                  onClick={() => handleAddFireClick(feed.id)}
                />
              )}
              <TelegramIcon onClick={shareVia} />
            </section>
          </section>
          <Typography variant="subtitle2">{firedCount} flames</Typography>
          <Typography className={styles.cartText} variant="h6">
            {feed.description}
          </Typography>
        </CardContent>
      </Card>
    </>
  ) : (
    <></>
  )
}

export default TheFeedsCard
