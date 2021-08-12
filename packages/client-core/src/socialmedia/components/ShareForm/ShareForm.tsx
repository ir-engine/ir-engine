import { Box, CardActionArea, CardActions, CardContent, CardMedia, makeStyles, Typography } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { updateShareFormState, updateNewFeedPageState } from '../../reducers/popupsState/service'
import styles from './ShareForm.module.scss'
import { Plugins } from '@capacitor/core'
import { useTranslation } from 'react-i18next'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { Share } from '@capacitor/share'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateShareFormState: bindActionCreators(updateShareFormState, dispatch),
  updateNewFeedPageState: bindActionCreators(updateNewFeedPageState, dispatch)
})

interface Props {
  updateShareFormState?: typeof updateShareFormState
  updateNewFeedPageState?: typeof updateNewFeedPageState
  popupsState?: any
}

const useStyles = makeStyles({
  root: {
    maxWidth: '375pt'
  },
  media: {
    height: '340pt',
    width: '375pt'
  },
  btn_share: {
    backgroundColor: 'black',
    color: 'white',
    bottom: '0',
    width: '100%',
    borderRadius: '12px',
    '&:hover': {
      backgroundColor: 'black',
      color: 'white'
    }
  }
})

const ShareForm = ({ updateShareFormState, updateNewFeedPageState, popupsState }: Props) => {
  const videoUrl = popupsState?.get('videoUrl')
  const previewUrl = popupsState?.get('imgSrc')
  const classes = useStyles()
  const { t } = useTranslation()

  const closePopUps = () => {
    updateShareFormState(false)
    updateNewFeedPageState(false)
  }

  const shareVia = () => {
    Share.share({
      title: t('social:shareForm.arcMedia'),
      text: t('social:shareForm.videoCreated'),
      url: encodeURI(videoUrl),
      dialogTitle: t('social:shareForm.shareWithBuddies')
    })
  }
  useEffect(() => {
    console.log('previewUrlpreviewUrl', previewUrl)
  })

  return (
    <div className={styles.shareFormContainer}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="45vh">
        <CardMedia
          className={classes.media + ' ' + styles.media}
          component="img"
          alt="Contemplative Reptile"
          src={previewUrl}
          // image={previewUrl}
          title="Arc"
          style={{ maxWidth: 'calc(100% - 36pt)', maxHeight: '40vh' }}
        />
      </Box>
      <Button size="large" color="primary" onClick={shareVia} className={classes.btn_share}>
        {t('social:shareForm.shareVideo')}
      </Button>
      {/*<Button size="large" color="primary" onClick={() => {updateShareFormState(false);}}*/}
      {/*  className={styles.btnAction}>*/}
      {/*  {t('social:shareForm.save')}*/}
      {/*</Button>*/}
      <Button
        size="large"
        color="primary"
        onClick={() => {
          closePopUps()
        }}
        className={styles.btnDisableAction}
      >
        {t('social:shareForm.close')}
      </Button>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareForm)
