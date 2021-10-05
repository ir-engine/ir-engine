/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectFeedCommentsState } from '../../reducers/feedComment/selector'
import { getFeedComments } from '../../reducers/feedComment/service'
import { addCommentToFeed } from '../../reducers/feedComment/service'
import TextField from '@material-ui/core/TextField'
import SendIcon from '@material-ui/icons/Send'
import Grid from '@material-ui/core/Grid'

import CommentCard from '../CommentCard'

import styles from './CommentList.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    feedCommentsState: selectFeedCommentsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeedComments: bindActionCreators(getFeedComments, dispatch),
  addCommentToFeed: bindActionCreators(addCommentToFeed, dispatch)
})

interface Props {
  feedId: string
  feedCommentsState?: any
  getFeedComments?: typeof getFeedComments
  addCommentToFeed?: typeof addCommentToFeed
}
const CommentList = ({ feedId, getFeedComments, feedCommentsState, addCommentToFeed }: Props) => {
  useEffect(() => {
    getFeedComments(feedId)
  }, [])
  const [commentText, setCommentText] = useState('')
  const addComment = (feedId, text) => {
    addCommentToFeed(feedId, text)
    setCommentText('')
  }
  return (
    <section className={styles.commentsContainer}>
      <Grid container spacing={1} alignItems="flex-end" style={{ margin: '20px 0px' }}>
        <Grid item xs={10} sm={10} md={4} lg={3}>
          <TextField
            value={commentText}
            multiline={true}
            placeholder="Add comment"
            style={{ width: '100%' }}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </Grid>
        <Grid item xs={2}>
          <SendIcon style={{ fontSize: 28 }} onClick={() => addComment(feedId, commentText)} />
        </Grid>
      </Grid>
      <>
        {feedCommentsState &&
          feedCommentsState.get('feedComments') &&
          feedCommentsState.get('fetching') === false &&
          feedCommentsState.get('feedComments').map((item, key) => <CommentCard key={key} comment={item} />)}
      </>
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentList)
