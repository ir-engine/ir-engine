import React, { forwardRef, useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import { useTranslation } from 'react-i18next'

// @ts-ignore
import styles from './TermsandPolicy.module.scss'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText'
import { Button, Typography } from '@material-ui/core'
import { bindActionCreators, Dispatch } from 'redux'
import { CreatorService } from '@xrengine/client-core/src/social/state/CreatorService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useCreatorState } from '@xrengine/client-core/src/social/state/CreatorState'
import { Link } from 'react-router-dom'

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

const TermsAndPolicy = ({ setView }: any) => {
  const creatorsState = useCreatorState()
  const currentCreator = creatorsState.creators.currentCreator.value
  const dispatch = useDispatch()

  // Made at the time of the test Aleks951
  const [openTerms, setOpenTerms] = useState(!!!currentCreator.terms)
  // const [openTerms, setOpenTerms] = useState(true)
  const [openPolicy, setOpenPolicy] = useState(!!!currentCreator.terms ? false : !!!currentCreator.policy)
  const { t } = useTranslation()
  const [agree, setAgree] = useState(false)
  const [agreePP, setAgreePP] = useState(false)

  const checkboxHandler = () => {
    // if agree === true, it will be set to false
    // if agree === false, it will be set to true
    setAgree(!agree)
    // Don't miss the exclamation mark
  }

  const checkboxHandlerPP = () => {
    // if agree === true, it will be set to false
    // if agree === false, it will be set to true
    setAgreePP(!agreePP)
    // Don't miss the exclamation mark
  }

  // const handleTermsAccept = () => {
  //   setOpenTerms(false)
  //   updateCreator({ id: creatorsState.get('currentCreator').id, terms: true })
  //   !!!currentCreator.policy && setOpenPolicy(true)
  // }

  // const handlePolicyAccept = () => {
  //   updateCreator({ id: creatorsState.get('currentCreator').id, policy: true })
  //   setOpenPolicy(false)
  // }

  const handleAccept = () => {
    setOpenTerms(false)
    setOpenPolicy(false)
    dispatch(
      CreatorService.updateCreator({
        id: creatorsState.creators.currentCreator?.id?.value,
        terms: true,
        policy: true,
        name: creatorsState.creators.currentCreator?.name?.value
      })
    )
  }

  return (
    <div className={styles.mainBlock}>
      <Dialog
        open={openTerms}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        className={styles.dialogWindow}
        PaperProps={{
          style: {
            width: '100%',
            maxWidth: '100%',
            height: 'max-content',
            borderRadius: '12px'
          }
        }}
      >
        <DialogContent>
          <DialogContentText>
            <Typography align="center" variant="subtitle1">
              {'By tapping "I agree to Terms of Service and Policy of Service", you agree to our '}
              {/* <Link className={styles.styleLink} to="/terms">
                Terms of Service
              </Link> */}
              <Button
                style={{
                  padding: '0'
                }}
                onClick={() => {
                  setView('terms')
                }}
              >
                <b>Terms of Service</b>
              </Button>
              {' and acknowledge that you have our '}
              {/* <Link className={styles.styleLink} to="/policy">
                Privacy Policy
              </Link> */}
              <Button
                style={{
                  padding: '0'
                }}
                onClick={() => {
                  setView('policy')
                }}
              >
                <b>Privacy Policy</b>
              </Button>
              {' to learn how we collect, use, and share your data.'}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <div className={styles.bottomBox}>
          <div>
            {/* Don't miss the exclamation mark* */}
            <Button variant="contained" onClick={handleAccept}>
              Agree and continue
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default TermsAndPolicy
