import React from 'react'
import styles from './toast.module.scss'

const Toast = ({
  messages = [] as any[],
  showAction = false,
  autoHideDuration = 3000,
  insertDirection = 'top',
  maxMessagesToShow = 4,
  customClass = ''
}) => {
  const renderMessage = (m, index) => {
    const style =
      autoHideDuration > 0
        ? { animationDelay: `0s, ${autoHideDuration}ms, ${autoHideDuration}ms` }
        : autoHideDuration === 0
        ? { animationDelay: `0s, 9999999999s, 9999999999s` }
        : {}
    return (
      <div className={styles.toastMessageContainer} key={index} style={style}>
        <div className={styles.toastMessage}>{m}</div>
        {showAction && (
          <button type="button" className={styles.toastAction}>
            X
          </button>
        )}
      </div>
    )
  }

  const renderToasts = () => {
    const msgs: JSX.Element[] = []
    if (insertDirection.toLowerCase() === 'top') {
      const limit = Math.max(messages.length - maxMessagesToShow, 0)
      for (let i = messages.length - 1; i >= limit; i--) {
        msgs.push(renderMessage(messages[i], i))
      }
    } else {
      const start = Math.max(messages.length - maxMessagesToShow, 0)
      for (let i = start; i < messages.length; i++) {
        msgs.push(renderMessage(messages[i], i))
      }
    }

    return msgs
  }
  return <div className={styles.toastContainer + ' ' + (customClass || '')}>{renderToasts()}</div>
}

export default Toast
