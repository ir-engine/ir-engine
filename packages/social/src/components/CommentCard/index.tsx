/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react'

import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import WhatshotIcon from '@material-ui/icons/Whatshot'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'

import styles from './CommentCard.module.scss'
import { CommentInterface } from '@xrengine/common/src/interfaces/Comment'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import SimpleModal from '../SimpleModal'
import { addFireToFeedComment, getCommentFires, removeFireToFeedComment } from '../../reducers/feedComment/service'
import { selectFeedCommentsState } from '../../reducers/feedComment/selector'
import PopupLogin from '../PopupLogin/PopupLogin'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {
    feedCommentsState: selectFeedCommentsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  addFireToFeedComment: bindActionCreators(addFireToFeedComment, dispatch),
  removeFireToFeedComment: bindActionCreators(removeFireToFeedComment, dispatch),
  getCommentFires: bindActionCreators(getCommentFires, dispatch)
})

interface Props {
  addFireToFeedComment?: typeof addFireToFeedComment
  removeFireToFeedComment?: typeof removeFireToFeedComment
  comment: CommentInterface
  getCommentFires?: typeof getCommentFires
  feedCommentsState?: any
}

const CommentCard = ({
  comment,
  addFireToFeedComment,
  removeFireToFeedComment,
  getCommentFires,
  feedCommentsState
}: Props) => {
  const { id, creator, fires, text, isFired } = comment
  const [openFiredModal, setOpenFiredModal] = useState(false)

  const handleAddFireClick = (feedId) => addFireToFeedComment(feedId)
  const handleRemoveFireClick = (feedId) => removeFireToFeedComment(feedId)

  const handleGetCommentFiredUsers = (id) => {
    getCommentFires(id)
    setOpenFiredModal(true)
  }
  const [buttonPopup, setButtonPopup] = useState(false)
  const checkGuest = useAuthState().authUser?.identityProvider?.type?.value === 'guest' ? true : false
  const { t } = useTranslation()

  return (
    <>
      <Card className={styles.commentItem} square={false} elevation={0} key={id}>
        <Avatar className={styles.authorAvatar} src={creator.avatar} />
        <CardContent className={styles.commentCard}>
          <Typography variant="h6">
            {creator.username}
            {creator.verified && (
              <VerifiedUserIcon htmlColor="#007AFF" style={{ fontSize: '13px', margin: '0 0 0 5px' }} />
            )}
          </Typography>
          <Typography variant="body1" paragraph={true}>
            {text}
          </Typography>
          {fires && fires > 0 ? (
            <Typography
              variant="subtitle1"
              onClick={() => (checkGuest ? setButtonPopup(true) : handleGetCommentFiredUsers(id))}
            >
              <span className={styles.flamesCount}>{fires}</span>
              {t('social:flames')}
            </Typography>
          ) : null}
        </CardContent>
        <section className={styles.fire}>
          {isFired ? (
            <WhatshotIcon
              htmlColor="#FF6201"
              onClick={() => (checkGuest ? setButtonPopup(true) : handleRemoveFireClick(id))}
            />
          ) : (
            <WhatshotIcon
              htmlColor="#DDDDDD"
              onClick={() => (checkGuest ? setButtonPopup(true) : handleAddFireClick(id))}
            />
          )}
        </section>
      </Card>
      <SimpleModal
        type={'comment-fires'}
        list={feedCommentsState.get('commentFires')}
        open={openFiredModal}
        onClose={() => (checkGuest ? setButtonPopup(true) : setOpenFiredModal(false))}
      />
      <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}>
        {/* <IndexPage /> */}
      </PopupLogin>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentCard)
