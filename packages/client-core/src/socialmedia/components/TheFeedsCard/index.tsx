/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>, Gleb Ordinsky
 */
import React, { useState, useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'

import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'

import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import WhatshotIcon from '@material-ui/icons/Whatshot'
import TelegramIcon from '@material-ui/icons/Telegram'
import VisibilityIcon from '@material-ui/icons/Visibility'

import { Feed } from '@xrengine/common/src/interfaces/Feed'
import CreatorAsTitle from '../CreatorAsTitle'
import styles from './TheFeedsCard.module.scss'
import SimpleModal from '../SimpleModal'
import { addViewToFeed } from '../../reducers/feed/service'
import { selectFeedFiresState } from '../../reducers/feedFires/selector'
import { selectTheFeedsFiresState } from '../../reducers/thefeedsFires/selector'
import { getTheFeedsFires, addFireToTheFeeds, removeFireToTheFeeds } from '../../reducers/thefeedsFires/service'
import PopupLogin from '../PopupLogin/PopupLogin'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { getLoggedCreator } from '../../reducers/creator/service'

import Featured from '../Featured'
import { Plugins } from '@capacitor/core'
import { useTranslation } from 'react-i18next'

const { Share } = Plugins

const mapStateToProps = (state: any): any => {
  return {
    thefeedsFiresState: selectTheFeedsFiresState(state),
    authState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getTheFeedsFires: bindActionCreators(getTheFeedsFires, dispatch),
  addFireToTheFeeds: bindActionCreators(addFireToTheFeeds, dispatch),
  removeFireToTheFeeds: bindActionCreators(removeFireToTheFeeds, dispatch)
})
interface Props {
  feed: Feed
  thefeedsFiresState?: any
  authState?: any
  getTheFeedsFires?: any
  addFireToTheFeeds?: any
  removeFireToTheFeeds?: any
}
const TheFeedsCard = (props: Props): any => {
  const [buttonPopup, setButtonPopup] = useState(false)
  const [fired, setFired] = useState(false)
  const { feed, authState, getTheFeedsFires, thefeedsFiresState, addFireToTheFeeds, removeFireToTheFeeds } = props
  const [firedCount, setFiredCount] = useState(feed.fires)

  const [thefeedsFiresCreators, setThefeedsFiresCreators] = useState(null)

  const handleAddFireClick = (feedId) => {
    addFireToTheFeeds(feedId)
    setFiredCount(firedCount + 1)
    setFired(true)
  }
  const handleRemoveFireClick = (feedId) => {
    removeFireToTheFeeds(feedId)
    setFiredCount(firedCount - 1)
    setFired(false)
  }

  useEffect(() => {
    getTheFeedsFires(feed.id, setThefeedsFiresCreators)
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

  const theFeedsFiresList = thefeedsFiresState?.get('thefeedsFires')
  const creatorId = authState.get('currentCreator').id

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

export default connect(mapStateToProps, mapDispatchToProps)(TheFeedsCard)
