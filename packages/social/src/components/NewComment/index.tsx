/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import TextField from '@material-ui/core/TextField'
import MessageIcon from '@material-ui/icons/Message'
import styles from './NewComment.module.scss'
import { FeedCommentService } from '@xrengine/client-core/src/social/reducers/feedComment/FeedCommentService'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import PopupLogin from '../PopupLogin/PopupLogin'
import { useTranslation } from 'react-i18next'

interface Props {
  feedId: any
}

const NewComment = ({ feedId }: Props) => {
  const [composingComment, setComposingComment] = useState('')
  const [buttonPopup, setButtonPopup] = useState(false)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const commentRef = React.useRef<HTMLInputElement>()

  const handleComposingCommentChange = (event: any): void => {
    setComposingComment(event.target.value)
  }
  const handleAddComment = () => {
    composingComment.trim().length > 0 && dispatch(FeedCommentService.addCommentToFeed(feedId, composingComment))
    setComposingComment('')
  }
  const checkGuest = useAuthState().authUser?.identityProvider?.type?.value === 'guest' ? true : false

  return (
    <section className={styles.messageContainer}>
      <TextField
        ref={commentRef}
        value={composingComment}
        onChange={handleComposingCommentChange}
        fullWidth
        placeholder={t('social:comment.add')}
      />
      <MessageIcon
        className={styles.sendButton}
        onClick={() => (checkGuest ? setButtonPopup(true) : handleAddComment())}
      />
      <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}>
        {/* <IndexPage /> */}
      </PopupLogin>
    </section>
  )
}

export default NewComment
