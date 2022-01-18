import React, { useState } from 'react'
import emailjs from 'emailjs-com'
import styles from './ContactForm.module.scss'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

export const ContactForm = () => {
  const { t } = useTranslation()
  const [userName, setUserName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState({
    userName: '',
    emailAddress: '',
    message: ''
  })
  const [dialogMsg, setDialogMsg] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    var templateParams = {
      from_name: userName,
      to_name: 'Administrator',
      company: companyName,
      email: emailAddress,
      message: message
    }

    emailjs
      .send(
        globalThis.process.env['VITE_EMAILJS_SERVICE_ID']!,
        globalThis.process.env['VITE_EMAILJS_TEMPLATE_ID']!,
        templateParams,
        globalThis.process.env['VITE_EMAILJS_USER_ID']
      )
      .then(
        (_) => {
          displayDialog(t('xrengineContact.lbl-success'))
        },
        (_) => {
          displayDialog(t('xrengineContact.lbl-failure'))
        }
      )

    setUserName('')
    setEmailAddress('')
    setCompanyName('')
    setMessage('')
  }

  const validate = (): boolean => {
    const validationError: {
      userName: string
      emailAddress: string
      message: string
    } = {} as any

    let flag = false

    if (!userName) {
      flag = true
      validationError.userName = t('xrengineContact.err-username')
    }
    if (!emailAddress) {
      flag = true
      validationError.emailAddress = t('xrengineContact.err-email')
    }
    if (!message) {
      flag = true
      validationError.message = t('xrengineContact.err-msg')
    }

    setError(validationError)

    return flag
  }

  const handleChange = (e) => {
    const tempError = JSON.parse(JSON.stringify(error))
    tempError[e.target.name] = ''

    setError(tempError)

    if (e.target.name === 'userName') {
      setUserName(e.target.value)
    } else if (e.target.name === 'emailAddress') {
      setEmailAddress(e.target.value)
    } else if (e.target.name === 'companyName') {
      setCompanyName(e.target.value)
    } else if (e.target.name === 'message') {
      setMessage(e.target.value)
    }
  }

  const displayDialog = (msg) => {
    setDialogMsg(msg)
  }

  return (
    <div className={styles.emailDiv}>
      <p className={styles.emailTitle}>{t('xrengineContact.header')}</p>
      <p className={styles.emailDetail}>{t('xrengineContact.description')}</p>
      <div className={styles.formControl}>
        <label className={styles.inputLabel}>{t('xrengineContact.lbl-name')}</label>
        <input type="text" className={styles.emailInput} value={userName} name="userName" onChange={handleChange} />
        {error.userName && <p className={styles.error}>{error.userName}</p>}
      </div>
      <div className={styles.formControl}>
        <label className={styles.inputLabel}>{t('xrengineContact.lbl-email')}</label>
        <input
          type="text"
          className={styles.emailInput}
          value={emailAddress}
          name="emailAddress"
          onChange={handleChange}
        />
        {error.emailAddress && <p className={styles.error}>{error.emailAddress}</p>}
      </div>
      <div className={styles.formControl}>
        <label className={styles.inputLabel}>{t('xrengineContact.lbl-company')}</label>
        <input
          type="text"
          className={styles.emailInput}
          value={companyName}
          name="companyName"
          onChange={handleChange}
        />
      </div>
      <div className={styles.formControl}>
        <label className={styles.inputLabel}>{t('xrengineContact.lbl-project')}</label>
        <textarea className={styles.emailInput} value={message} name="message" onChange={handleChange} />
        {error.message && <p className={styles.error}>{error.message}</p>}
      </div>
      <div className={styles.btnContainer}>
        <button type="button" onClick={handleSubmit}>
          {t('xrengineContact.lbl-send')}
        </button>
      </div>
      <Dialog open={!!dialogMsg} onClose={() => displayDialog('')}>
        <DialogContent className={styles.dialog}>
          <DialogContentText id="alert-dialog-description" className={styles.dialogText}>
            {dialogMsg}
          </DialogContentText>
          <button type="button" onClick={() => displayDialog('')}>
            {t('xrengineContact.lbl-ok')}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ContactForm
