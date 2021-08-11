/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Button from '@material-ui/core/Button'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectCreatorsState } from '../../reducers/creator/selector'
import {
  followCreator,
  getCreator,
  getFollowersList,
  getFollowingList,
  unFollowCreator
} from '../../reducers/creator/service'
import CreatorCard from '../CreatorCard'
import Featured from '../Featured'
import { useTranslation } from 'react-i18next'
import AppFooter from '../Footer'
import styles from './Creator.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    creatorState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getCreator: bindActionCreators(getCreator, dispatch),
  followCreator: bindActionCreators(followCreator, dispatch),
  unFollowCreator: bindActionCreators(unFollowCreator, dispatch),
  getFollowersList: bindActionCreators(getFollowersList, dispatch),
  getFollowingList: bindActionCreators(getFollowingList, dispatch)
})

interface Props {
  creatorId: string
  creatorState?: any
  getCreator?: typeof getCreator
  followCreator?: typeof followCreator
  unFollowCreator?: typeof unFollowCreator
  getFollowersList?: typeof getFollowersList
  getFollowingList?: typeof getFollowingList
  creatorData?: any
}

const Creator = ({
  creatorId,
  creatorState,
  getCreator,
  followCreator,
  unFollowCreator,
  getFollowersList,
  getFollowingList,
  creatorData
}: Props) => {
  const [isMe, setIsMe] = useState(false)
  useEffect(() => {
    if (
      creatorState &&
      creatorState.get('fetchingCurrentCreator') === false &&
      creatorState.get('currentCreator') &&
      creatorId === creatorState.get('currentCreator').id
    ) {
      setIsMe(true)
    } else {
      if (!creatorData) {
        getCreator(creatorId)
      }
    }
  }, [])
  const { t } = useTranslation()
  const [videoType, setVideoType] = useState('creator')
  return (
    <>
      <section className={styles.creatorContainer}>
        <CreatorCard
          creator={
            isMe === true
              ? creatorState?.get('currentCreator')
              : creatorData
              ? creatorData
              : creatorState?.get('creator')
          }
        />
        {isMe && (
          <section className={styles.videosSwitcher}>
            <Button
              variant={videoType === 'creator' ? 'contained' : 'text'}
              className={styles.switchButton + (videoType === 'creator' ? ' ' + styles.active : '')}
              onClick={() => setVideoType('creator')}
            >
              {t('social:creator.myVideos')}
            </Button>
            <Button
              variant={videoType === 'fired' ? 'contained' : 'text'}
              className={styles.switchButton + (videoType === 'fired' ? ' ' + styles.active : '')}
              onClick={() => setVideoType('fired')}
            >
              {t('social:creator.savedVideos')}
            </Button>
          </section>
        )}
        <section className={styles.feedsWrapper}>
          <Featured
            creatorId={
              isMe === true
                ? creatorState?.get('currentCreator').id
                : creatorData
                ? creatorData.id
                : creatorState?.get('creator')?.id
            }
            type={videoType}
          />
        </section>
      </section>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Creator)
