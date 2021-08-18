/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectFeedCommentsState } from '../../reducers/feedComment/selector'
import { getFeedComments } from '../../reducers/feedComment/service'

import CommentCard from '../CommentCard'

import styles from './CommentList.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    feedCommentsState: selectFeedCommentsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeedComments: bindActionCreators(getFeedComments, dispatch)
})

interface Props {
  feedId: string
  feedCommentsState?: any
  getFeedComments?: typeof getFeedComments
}
const CommentList = ({ feedId, getFeedComments, feedCommentsState }: Props) => {
  useEffect(() => {
    getFeedComments(feedId)
  }, [])
  return (
    <section className={styles.commentsContainer}>
      {feedCommentsState &&
        feedCommentsState.get('feedComments') &&
        feedCommentsState.get('fetching') === false &&
        feedCommentsState.get('feedComments').map((item, key) => <CommentCard key={key} comment={item} />)}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentList)
