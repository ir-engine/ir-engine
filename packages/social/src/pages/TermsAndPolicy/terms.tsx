import terms from '../../components/TermsandPolicy/terms'
import React from 'react'
import styles from './TermsandPolicy.module.scss'
import { Link } from 'react-router-dom'
import { DialogContent, DialogContentText } from '@material-ui/core'

const Terms = React.memo(() => {
  return (
    <div>
      <Link to="/">{'< Back'}</Link>
      <DialogContent>
        <DialogContentText>
          <div dangerouslySetInnerHTML={{ __html: terms }} />
        </DialogContentText>
      </DialogContent>
    </div>
  )
})

export default Terms
