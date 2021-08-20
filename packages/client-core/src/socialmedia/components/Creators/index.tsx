/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import PersonPinIcon from '@material-ui/icons/PersonPin'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { getCreators } from '../../reducers/creator/service'
import styles from './Creators.module.scss'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { updateCreatorPageState } from '../../reducers/popupsState/service'
import Avatar from '@material-ui/core/Avatar'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state),
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getCreators: bindActionCreators(getCreators, dispatch),
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch)
})

interface Props {
  creatorsState?: any
  popupsState?: any
  getCreators?: any
  updateCreatorPageState?: typeof updateCreatorPageState
}

const Creators = ({ creatorsState, getCreators, popupsState, updateCreatorPageState }: Props) => {
  useEffect(() => getCreators(), [])
  const creators =
    creatorsState && creatorsState.get('creators') && creatorsState.get('fetchingCreators') === false
      ? creatorsState.get('creators')
      : null
  const handleCreatorView = (id) => {
    updateCreatorPageState(false)
    updateCreatorPageState(true, id)
  }

  return (
    <section className={styles.creatorContainer}>
      {/*     <h3>Featured Creators</h3> */}
      {creators &&
        creators.length > 0 &&
        creators?.map((item, itemIndex) => (
          <Card className={styles.creatorItem} elevation={0} key={itemIndex} onClick={() => handleCreatorView(item.id)}>
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
