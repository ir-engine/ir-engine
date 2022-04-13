import React from 'react'

import Typography from '@mui/material/Typography'

export const BrowserMessages = ({ styles, browser }) => [
  browser.isChrome && {
    message: (
      <Typography gutterBottom>
        In Chrome, go to <span className={styles.span}>Chrome Menu</span> &gt;{' '}
        <span className={styles.span}>Settings</span> &gt; <span className={styles.span}>Advanced</span>. Under{' '}
        <span className={styles.span}>System</span>, enable{' '}
        <span className={styles.span}>Use Hardware acceleration</span>
        when available and relauch your browser.
      </Typography>
    )
  },
  browser.isFirefox && {
    message: (
      <Typography gutterBottom>
        In FireFox, type the <span className={styles.span}>about:config</span> address in the address bar and navigate
        to it. You need to click on <span className={styles.span}>Accept the risk and continue</span>. Search for the{' '}
        <span className={styles.span}>layers.acceleration.force-enabled</span> property, and set it to true and relauch
        your browser.
      </Typography>
    )
  }
]
