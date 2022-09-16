import React, { useState } from 'react'

import { Check, ContentCopy, Create, GitHub, Send } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import styles from '../index.module.scss'

export const CopyButton = ({ address, iconStyle, copyStyle }) => {
  const [copyState, setCopyState] = useState(false)

  const copyToClipboard = (text) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      setCopyState(true)
      setTimeout(() => {
        setCopyState(false)
      }, 2000)
      return navigator.clipboard.writeText(text)
    }
  }

  return (
    <>
      {address.startsWith('juno') &&
        (!copyState ? (
          <Tooltip title="Copy Address" placement="bottom">
            <a className={iconStyle} onClick={() => copyToClipboard(address)}>
              <ContentCopy fontSize="small" className={copyStyle} />
            </a>
          </Tooltip>
        ) : (
          <Tooltip title="Copied" placement="bottom">
            <a className={iconStyle} onClick={() => copyToClipboard(address)}>
              <Check fontSize="small" className={copyStyle} />
            </a>
          </Tooltip>
        ))}
    </>
  )
}
