import policy from '../../components/TermsandPolicy/policy'
import React from 'react'
import styles from './TermsandPolicy.module.scss'
import { Link } from 'react-router-dom'

const Policy = React.memo(() => {
  return (
    <div className={styles.myContainer}>
      <Link to="/">{'< Back'}</Link>
      <div dangerouslySetInnerHTML={{ __html: policy }} />
    </div>
  )
})

export default Policy
