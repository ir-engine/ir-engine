import React, { useState } from 'react'

import { Help } from '@mui/icons-material'
import { Error } from '@mui/icons-material'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

import { reportIssueService } from '../../common/services/ReportIssueService'
import styles from './index.module.scss'

interface Props {
  animate?: any
}
const SubmitBugButton = (props: Props) => {
  const [showHelpLoading, setShowHelpLoading] = useState(false)
  const [showReportLoading, setShowReportLoading] = useState(false)

  const handleHelpClick = () => {
    setShowHelpLoading(true)
  }
  const handleReportClick = () => {
    setShowReportLoading(true)
    reportIssueService.submitIssue()
    setShowReportLoading(false)
  }

  return (
    <React.Fragment>
      <div className={`${styles.container} ${props.animate}`}>
        <Chip
          className={styles.helpBtn}
          icon={showHelpLoading ? <CircularProgress size={10} /> : <Help />}
          label="Help"
          onClick={handleHelpClick}
          variant="outlined"
        />
        <Chip
          className={styles.reportBtn}
          icon={showReportLoading ? <CircularProgress size={10} /> : <Error />}
          label="Report Issue"
          onClick={handleReportClick}
          variant="outlined"
        />
      </div>
    </React.Fragment>
  )
}

export default SubmitBugButton
