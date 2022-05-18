import React, { forwardRef, useState } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import { PopupsStateService } from '@xrengine/client-core/src/social/services/PopupsStateService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
import { Box, CardMedia, makeStyles, Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import StepWizard from 'react-step-wizard'
// import { Plugins } from '@capacitor/core';
//
// const {XRPlugin} = Plugins;
import { XRPlugin } from 'webxr-native'
import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'

// @ts-ignore
import classes from './ViewMode.module.scss'

const useStyles = makeStyles({})

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

interface Props {}

export const ViewMode = ({ onGoRegistration }: any) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const creatorsState = useCreatorState()
  const currentCreator = creatorsState.creators.currentCreator.value
  const dispatch = useDispatch()
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
        <p>{t('social:view.welcome')}</p>
      </div>
    )
  }
  const First = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }

    return (
      <div>
        <h3 className="text-center">{t('social:view.step', { step: '1' })}</h3>
        <p>{t('social:view.text-step-1')}</p>
      </div>
    )
  }

  const Two = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }

    return (
      <div>
        <h3 className="text-center">{t('social:view.step', { step: '2' })}</h3>
        <p>{t('social:view.text-step-2')}</p>
      </div>
    )
  }

  const Tree = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }

    return (
      <div>
        <h3 className="text-center">{t('social:view.step', { step: '3' })}</h3>
        <p>{t('social:view.text-step-3-part-1')}</p>
        <p>{t('social:view.text-step-3-part-2')}</p>
        <p>{t('social:view.text-step-3-part-3')}</p>
      </div>
    )
  }

  const Four = (props) => {
    const update = (e) => {
      props.update(e.target.name, e.target.value)
    }

    return (
      <div>
        <h3 className="text-center">{t('social:view.step', { step: '4' })}</h3>
        <p>{t('social:view.text-step-4-part-1')}</p>
        <p>{t('social:view.text-step-4-part-2')}</p>
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
    CreatorService.updateCreator({
      id: creatorsState.creators.currentCreator?.id?.value,
      steps: true,
      name: creatorsState.creators.currentCreator?.name?.value,
      username: creatorsState.creators.currentCreator?.username?.value
    })
    handleOpenNewFeedPage()
  }

  const handleOpenNewFeedPage = () => {
    setOpen(false)
    PopupsStateService.updateArMediaState(true)
  }

  return (
    <div
      // onClick={() => {
      //   onGoRegistration()
      // }}
      className={classes.mainBlock}
    >
      {/*     <AddCircleIcon onClick={handleClickOpen} style={{fontSize: '5em'}} /> */}
      <img
        src="/assets/tabBar(1).svg"
        onClick={handleClickOpen}
        style={{
          cursor: 'pointer'
        }}
      />
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
            {t('social:cancel')}
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
            {t('social:view.not-show')}
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

export default ViewMode
