import React, { forwardRef, useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import { useTranslation } from 'react-i18next'

// @ts-ignore
import styles from './TermsandPolicy.module.scss'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText'
import termsText from './terms'
import policyText from './policy'
import Button from '@material-ui/core/Button'
import { bindActionCreators, Dispatch } from 'redux'
import { updateCreator } from '../../reducers/creator/service'
import { connect } from 'react-redux'
import { selectCreatorsState } from '../../reducers/creator/selector'

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateCreator: bindActionCreators(updateCreator, dispatch)
})

export const TermsAndPolicy = ({ creatorsState, updateCreator }: any) => {
  const currentCreator = creatorsState.get('currentCreator')

  const [openTerms, setOpenTerms] = useState(!!!currentCreator.terms)
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

  const handleTermsAccept = () => {
    setOpenTerms(false)
    updateCreator({ id: creatorsState.get('currentCreator').id, terms: true })
    !!!currentCreator.policy && setOpenPolicy(true)
  }

  const handlePolicyAccept = () => {
    updateCreator({ id: creatorsState.get('currentCreator').id, policy: true })
    setOpenPolicy(false)
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
            <div dangerouslySetInnerHTML={{ __html: termsText }} />
          </DialogContentText>
        </DialogContent>
        <div className={styles.bottomBox}>
          <div>
            <div>
              <input type="checkbox" id="agree" onChange={checkboxHandler} />
              <label htmlFor="agree"> {t('social:terms.confirmTerms')}</label>
            </div>
            {/* Don't miss the exclamation mark* */}
            <Button variant="contained" disabled={!agree} onClick={handleTermsAccept}>
              {t('social:continue')}
            </Button>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={openPolicy}
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
            <div dangerouslySetInnerHTML={{ __html: policyText }} />
          </DialogContentText>
        </DialogContent>
        <div className={styles.bottomBox}>
          <div>
            <div>
              <input type="checkbox" id="agreePP" onChange={checkboxHandlerPP} />
              <label htmlFor="agree"> {t('social:terms.confirmPolicy')}</label>
            </div>
            {/* Don't miss the exclamation mark* */}
            <Button variant="contained" disabled={!agreePP} className="btn" onClick={handlePolicyAccept}>
              {t('social:continue')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(TermsAndPolicy)
