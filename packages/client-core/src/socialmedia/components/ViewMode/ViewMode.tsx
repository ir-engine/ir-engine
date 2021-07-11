import React, { forwardRef, useState } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import { bindActionCreators, Dispatch } from 'redux'
import { updateArMediaState } from '../../reducers/popupsState/service'
import { connect } from 'react-redux'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { Box, CardMedia, makeStyles, Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
// import { Plugins } from '@capacitor/core';
//
// const {XRPlugin} = Plugins;
import { XRPlugin } from 'webxr-native'

// @ts-ignore
import classes from './ViewMode.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateArMediaState: bindActionCreators(updateArMediaState, dispatch)
})

const useStyles = makeStyles({})

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

interface Props {
  updateArMediaState?: typeof updateArMediaState
}

export const ViewMode = ({ updateArMediaState }: Props) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const handleClickOpen = () => {
    if (XRPlugin.accessPermission !== undefined) {
      // @ts-ignore
      XRPlugin.accessPermission({})
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpenNewFeedPage = () => {
    setOpen(false)
    updateArMediaState(true)
  }
  return (
    <div className={classes.mainBlock}>
      {/*     <AddCircleIcon onClick={handleClickOpen} style={{fontSize: '5em'}} /> */}
      <img src="/assets/tabBar(1).svg" onClick={handleClickOpen} />
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        className={classes.dialogWindow}
        PaperProps={{
          style: {
            width: '100%',
            maxWidth: '100%',
            height: 'max-content',
            borderRadius: '12px'
          }
        }}
      >
        <div className={classes.popup}>
          <Button onClick={handleClose} color="primary" className={classes.btn_cancel}>
            {t('social:view.cancel')}
          </Button>
          <Box className={classes.box} borderTop={1} style={{ color: '#e6e5eb', height: '2px' }} />
          <h3 className={classes.title}>{'Remember!'} </h3>
          <Typography style={{ textAlign: 'center', paddingTop: '8pt', color: 'rgba(60 60 67, 0.6)' }}>
            {t('social:view.choice')}
          </Typography>
          <div className={classes.horizontalMode}>
            <div>
              <CardMedia
                className={classes.media}
                image="https://cdn.zeplin.io/601d63dc422d9dad3473e3ab/assets/C9623B05-AC7F-4D88-B8EC-2D1951CE2767.svg"
                title="Arc"
              />
              <Typography style={{ textAlign: 'center', color: 'rgba(60 60 67, 0.6)' }}>
                {t('social:view.verticalMode')}
              </Typography>
            </div>
            <Box className={classes.box} borderTop={1} style={{ color: '#e6e5eb', height: '2px' }} />
            <div>
              <CardMedia
                className={classes.media2}
                image="https://cdn.zeplin.io/601d63dc422d9dad3473e3ab/assets/802EB928-4227-4940-BA8E-0A8119FE4CDF.svg"
                title="Arc"
              />
              <Typography style={{ textAlign: 'center', color: 'rgba(60 60 67, 0.6)' }}>
                {t('social:view.horizontalMode')}
              </Typography>
            </div>
          </div>
          <Button
            onClick={() => {
              handleOpenNewFeedPage()
            }}
            color="primary"
            className={classes.btn_start}
          >
            {t('social:view.start')}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewMode)
