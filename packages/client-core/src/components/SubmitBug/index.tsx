import React, { useEffect, useState } from 'react'

import { Help } from '@mui/icons-material'
import { Error } from '@mui/icons-material'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

import { reportIssueService } from '../../common/services/ReportIssueService'
import { prepareReportIssue } from '../../util/prepareReportIssue'
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
  useEffect(() => {
    setTimeout(() => {
      prepareReportIssue()
    }, 2000)
  }, [])
  const handleReportClick = async () => {
    setShowReportLoading(true)
    const reportData = prepareReportIssue()
    await reportIssueService.submitIssue(reportData)
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
