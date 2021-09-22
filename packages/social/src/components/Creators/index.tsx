/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Card, CardContent, CardMedia, Typography, Avatar } from '@material-ui/core'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import PersonPinIcon from '@material-ui/icons/PersonPin'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { getBlockedList, getCreators } from '../../reducers/creator/service'
// @ts-ignore
import styles from './Creators.module.scss'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { updateCreatorPageState } from '../../reducers/popupsState/service'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state),
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getCreators: bindActionCreators(getCreators, dispatch),
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
  getBlockedList: bindActionCreators(getBlockedList, dispatch)
})

interface Props {
  creatorsState?: any
  popupsState?: any
  getCreators?: any
  updateCreatorPageState?: typeof updateCreatorPageState
  getBlockedList?: typeof getBlockedList
}

const Creators = ({ creatorsState, getCreators, popupsState, updateCreatorPageState, getBlockedList }: Props) => {
  useEffect(() => getCreators(), [])
  const creators =
    creatorsState && creatorsState.get('creators') && creatorsState.get('fetchingCreators') === false
      ? creatorsState.get('creators')
      : null

  const handleCreatorView = (id) => {
    updateCreatorPageState(false)
    updateCreatorPageState(true, id)
  }

  const currentCreator = creatorsState.get('currentCreator')
  useEffect(() => {
    getBlockedList(currentCreator)
  }, [])
  const blackList = creatorsState?.get('blocked')
  // console.log(Array.from(new Set(blackList?.map((item: any) => item.id))))

  return (
    <section className={styles.creatorContainer}>
      {/*     <h3>Featured Creators</h3> */}
      {creators &&
        blackList &&
        creators.length > 0 &&
        creators
          ?.filter((person) => person.isBlocked < 1)
          .map((item, itemIndex) => (
            <Card
              className={styles.creatorItem}
              elevation={0}
              key={itemIndex}
              onClick={() => handleCreatorView(item.id)}
            >
              {item.avatar ? (
                <CardMedia className={styles.previewImage} image={item.avatar || <PersonPinIcon />} title={item.name} />
              ) : (
                <section className={styles.previewImage}>
                  <Avatar className={styles.avatarPlaceholder} />
                </section>
              )}
              <CardContent>
                <Typography className={styles.titleContainer}>
                  {item.name}
                  {item.verified === 1 && (
                    <VerifiedUserIcon htmlColor="#007AFF" style={{ fontSize: '13px', margin: '0 0 0 5px' }} />
                  )}
                </Typography>
                <Typography className={styles.usernameContainer}>{item.username}</Typography>
              </CardContent>
            </Card>
          ))}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Creators)
