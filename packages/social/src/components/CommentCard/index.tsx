/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react'

import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

import styles from './CommentCard.module.scss'
import { CommentInterface } from '@xrengine/common/src/interfaces/Comment'

import { useDispatch } from '@xrengine/client-core/src/store'
import SimpleModal from '../SimpleModal'
import { FeedCommentService } from '@xrengine/client-core/src/social/state/FeedCommentService'
import { useFeedCommentsState } from '@xrengine/client-core/src/social/state/FeedCommentService'
import PopupLogin from '../PopupLogin/PopupLogin'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthService'
import { useTranslation } from 'react-i18next'

interface Props {
  comment: CommentInterface
}

const CommentCard = ({ comment }: Props) => {
  const { id, creator, fires, text, isFired } = comment
  const [openFiredModal, setOpenFiredModal] = useState(false)
  const dispatch = useDispatch()
  const handleAddFireClick = (feedId) => {
    FeedCommentService.addFireToFeedComment(feedId)
  }
  const handleRemoveFireClick = (feedId) => {
    FeedCommentService.removeFireToFeedComment(feedId)
  }
  const feedCommentsState = useFeedCommentsState()
  const handleGetCommentFiredUsers = (id) => {
    FeedCommentService.getCommentFires(id)
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
        list={feedCommentsState.feeds.commentFires.value}
        open={openFiredModal}
        onClose={() => (checkGuest ? setButtonPopup(true) : setOpenFiredModal(false))}
      />
      <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}>
        {/* <IndexPage /> */}
      </PopupLogin>
    </>
  )
}

export default CommentCard
