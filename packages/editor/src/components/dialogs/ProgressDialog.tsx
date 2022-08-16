import i18n from 'i18next'
import React from 'react'
import styled from 'styled-components'

import CircularProgress from '@mui/material/CircularProgress'

import ProgressBar from '../inputs/ProgressBar'
import Dialog from './Dialog'

/**
 * ProgressContainer used as a wrapper element for the ProgressMessage and ProgressBar components.
 *
 * @type {Styled component}
 */
const ProgressContainer = (styled as any).div`
  color: var(--textColor);
  display: flex;
  flex: 1;
  flex-direction: column;
  /* This forces firefox to give the contents a proper height. */
  overflow: hidden;
  padding: 8px;
`

/**
 * ProgressMessage used to provide styles to the message content on ProgressDialog.
 *
 * @type {styled component}
 */
const ProgressMessage = (styled as any).div`
  margin: auto;
  white-space: pre;
`

interface Props {
  cancelable?: boolean
  message: string
  tag?
  title?
  bottomNav?
  children?
  cancelLabel?
  confirmLabel?
  onCancel?
  onConfirm?
}

/**
 * ProgressDialog component used to render view.
 *
 * @param       {string} message    [content to be shown on the ProgressDialog]
 * @param       {function} onConfirm
 * @param       {boolean} cancelable
 * @param       {function} onCancel
 * @param       {any} props
 * @constructor
 */
export function ProgressDialog(props: Props) {
  if (!props) return null
  return (
    <Dialog onCancel={props.cancelable ? props.onCancel : null} {...props}>
      <ProgressContainer>
        <ProgressMessage>{props.message}</ProgressMessage>
        <CircularProgress style={{ margin: 'auto' }} />
        {/* <ProgressBar /> */}
      </ProgressContainer>
    </Dialog>
  )
}

ProgressDialog.defaultProps = {
  title: i18n.t('editor:dialog.progress.title') || 'Loading...',
  message: i18n.t('editor:dialog.progress.message') || 'Loading...',
  cancelable: false,
  cancelLabel: i18n.t('editor:dialog.progress.lbl-cancel') || 'Cancel'
}
