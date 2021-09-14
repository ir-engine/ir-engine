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
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { Box, CardMedia, makeStyles, Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import StepWizard from 'react-step-wizard'
// import { Plugins } from '@capacitor/core';
//
// const {XRPlugin} = Plugins;
import { XRPlugin } from 'webxr-native'
import { updateCreator } from '../../reducers/creator/service'

// @ts-ignore
import classes from './ViewMode.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state),
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateArMediaState: bindActionCreators(updateArMediaState, dispatch),
  updateCreator: bindActionCreators(updateCreator, dispatch)
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

export const ViewMode = ({ updateArMediaState, creatorsState, updateCreator }: any) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const currentCreator = creatorsState.get('currentCreator')

  const handleClickOpen = () => {
    if (XRPlugin.accessPermission !== undefined) {
      // @ts-ignore
      XRPlugin.accessPermission({})
    }
    if (currentCreator.steps == true) {
      handleOpenNewFeedPage()
    } else {
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const Greatings = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }
    return (
      <div>
        <p>
          Welcome to ARC!  Make personal videos with one of our holograms and post it to your social media channels!
        </p>
      </div>
    )
  }
  const First = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }

    return (
      <div>
        <h3 className="text-center">STEP 1</h3>
        <p>Choose a hologram from the library.</p>
      </div>
    )
  }

  const Two = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }

    return (
      <div>
        <h3 className="text-center">STEP 2</h3>
        <p>
          This is Augmented Reality, so scan the space with your camera from side to side  for 3-5 seconds where you
          want the hologram performance to be.
        </p>
      </div>
    )
  }

  const Tree = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }

    return (
      <div>
        <h3 className="text-center">STEP 3</h3>
        <p>Tap screen once on location where you want the hologram anchored.  </p>
        <p>TIP!  Tap once elsewhere to move the hologram to another position.   </p>
        <p>TIP!  You can resize the hologram by pinching or expanding the screen with your thumb and index finger.  </p>
      </div>
    )
  }

  const Four = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }

    return (
      <div>
        <h3 className="text-center">STEP 4</h3>
        <p>Double tap red record button to START your video recording.</p>
        <p>Double tap red record button to STOP.</p>
      </div>
    )
  }
  const Nav = (props) => {
    const dots = []
    for (let i = 1; i <= props.totalSteps; i += 1) {
      const isActive = props.currentStep === i
      dots.push(
        <span
          key={`step-${i}`}
          className={`${classes.dot} ${isActive ? classes.active : ''}`}
          onClick={() => props.goToStep(i)}
        >
          &bull;
        </span>
      )
    }

    return <div className={classes.nav}>{dots}</div>
  }

  const [state] = useState({
    form: {},
    transitions: {
      enterRight: `${classes.animated} ${classes.enterRight}`,
      enterLeft: `${classes.animated} ${classes.enterLeft}`,
      exitRight: `${classes.animated} ${classes.exitRight}`,
      exitLeft: `${classes.animated} ${classes.exitLeft}`,
      intro: `${classes.animated} ${classes.intro}`
    }
  })

  const handleSteps = () => {
    updateCreator({ id: creatorsState.get('currentCreator').id, steps: true })
    handleOpenNewFeedPage()
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
          <div>
            <StepWizard nav={<Nav />} transitions={state.transitions}>
              <Greatings />
              <First />
              <Two />
              <Tree />
              <Four />
            </StepWizard>
          </div>
          <Button color="primary" className={classes.btn_dont} onClick={handleSteps}>
            {' '}
            Do not show it again
          </Button>
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
