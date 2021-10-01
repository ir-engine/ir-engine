import terms from '../../components/TermsandPolicy/terms'
import React from 'react'
import styles from './TermsandPolicy.module.scss'
import { Link } from 'react-router-dom'

const Terms = React.memo(() => {
  return (
    <div className={styles.myContainer}>
      <Link to="/">{'< Back'}</Link>
      <div dangerouslySetInnerHTML={{ __html: terms }} />
    </div>
  )
})

export default Terms
