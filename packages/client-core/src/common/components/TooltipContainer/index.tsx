import React from 'react'
import styles from './ToolTipContainer.module.scss'
import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import Snackbar from '@material-ui/core/Snackbar'
import { connect } from 'react-redux'
import TouchApp from '@material-ui/icons/TouchApp'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import { useTranslation } from 'react-i18next'

interface Props {
  message?: string
  className?: string | ''
}

const TooltipContainer = (props: Props) => {
  const interactTip = isTouchAvailable ? <TouchApp /> : 'E'
  const { t } = useTranslation()
  return props.message ? (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      className={styles.TooltipSnackBar}
      open={true}
      autoHideDuration={1000}
    >
      <section className={styles.innerHtml + ' MuiSnackbarContent-root'}>
        <ErrorOutlineIcon color="secondary" />
        {t('common:tooltip.pressKey', { tip: interactTip, message: props.message })}
      </section>
    </Snackbar>
  ) : null
}

export default TooltipContainer
