/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Button from '@material-ui/core/Button'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { useCreatorState } from '../../reducers/creator/CreatorState'
import { CreatorService } from '../../reducers/creator/CreatorService'
import CreatorCard from '../CreatorCard'
import Featured from '../Featured'
import { useTranslation } from 'react-i18next'
import AppFooter from '../Footer'
import styles from './Creator.module.scss'

interface Props {
  creatorId: string
  creatorData?: any
}

const Creator = ({ creatorId, creatorData }: Props) => {
  const [isMe, setIsMe] = useState(false)
  const dispatch = useDispatch()
  const creatorState = useCreatorState()
  useEffect(() => {
    if (
      creatorState.creators.fetchingCurrentCreator.value === false &&
      creatorState.creators.currentCreator.value &&
      creatorId === creatorState.creators.currentCreator?.id?.value
    ) {
      setIsMe(true)
    } else {
      if (!creatorData) {
        dispatch(CreatorService.getCreator(creatorId))
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
              ? creatorState?.creators.currentCreator?.id?.value
              : creatorData
              ? creatorData
              : creatorState?.creators?.creator?.value
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
                ? creatorState?.creators?.currentCreator?.id?.value
                : creatorData
                ? creatorData.id
                : creatorState?.creators?.creator?.id?.value
            }
            type={videoType}
          />
        </section>
      </section>
    </>
  )
}

export default Creator
