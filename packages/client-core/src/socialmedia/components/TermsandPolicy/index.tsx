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

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

export const TermsAndPolicy = () => {
  const [open, setOpen] = useState(true)
  const [openPP, setOpenPP] = useState(false)
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

  // When the button is clicked
  const btnHandler = () => {
    setOpen(false)
    setOpenPP(true)
  }

  const btnHandlerPP = () => {
    setOpenPP(false)
  }

  return (
    <div className={styles.mainBlock}>
      <Dialog
        open={open}
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
            <div dangerouslySetInnerHTML={{__html: termsText}}/>          
          </DialogContentText>
        </DialogContent>
        <div className={styles.bottomBox}>
          <div>
            <div>
              <input type="checkbox" id="agree" onChange={checkboxHandler} />
              <label htmlFor="agree">{t('social:terms.confirmTerms')}</label>
            </div>
            {/* Don't miss the exclamation mark* */}
            <Button variant="contained" disabled={!agree} onClick={btnHandler}>
              {t('social:continue')}
            </Button>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={openPP}
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
            <div dangerouslySetInnerHTML={{__html: policyText}}/>    
          </DialogContentText>
        </DialogContent>
        <div className={styles.bottomBox}>
          <div>
            <div>
              <input type="checkbox" id="agreePP" onChange={checkboxHandlerPP} />
              <label htmlFor="agree">{t('social:terms.confirmPolicy')}</label>
            </div>
            {/* Don't miss the exclamation mark* */}
            <Button variant="contained" disabled={!agreePP} className="btn" onClick={btnHandlerPP}>
              {t('social:continue')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default TermsAndPolicy
