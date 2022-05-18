import { Box, CardActionArea, CardActions, CardContent, CardMedia, Typography } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import Button from '@material-ui/core/Button'
import Card from '@mui/material/Card'
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { PopupsStateService } from '@xrengine/client-core/src/social/services/PopupsStateService'
import styles from './ShareForm.module.scss'
import { Plugins } from '@capacitor/core'
import { useTranslation } from 'react-i18next'
import { usePopupsStateState } from '@xrengine/client-core/src/social/services/PopupsStateService'
import { Share } from '@capacitor/share'

interface Props {}

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

const ShareForm = (props: Props) => {
  const popupsState = usePopupsStateState()
  const videoUrl = popupsState.popups.videoUrl?.value
  const previewUrl = popupsState.popups.imgSrc?.value
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const closePopUps = () => {
    PopupsStateService.updateShareFormState(false)
    PopupsStateService.updateNewFeedPageState(false)
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

export default ShareForm
