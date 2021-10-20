import React from 'react'
import Dialog from './Dialog'
import ProgressBar from '../inputs/ProgressBar'
import styled from 'styled-components'
import i18n from 'i18next'

/**
 * ProgressContainer used as a wrapper element for the ProgressMessage and ProgressBar components.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const ProgressContainer = (styled as any).div`
  color: ${(props) => props.theme.text2};
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
 * @author Robert Long
 * @type {styled component}
 */
const ProgressMessage = (styled as any).div`
  padding-bottom: 24px;
  white-space: pre;
`

/**
 * ProgressDialog component used to render view.
 *
 * @author Robert Long
 * @param       {string} message    [content to be shown on the ProgressDialog]
 * @param       {function} onConfirm
 * @param       {boolean} cancelable
 * @param       {function} onCancel
 * @param       {any} props
 * @constructor
 */
export function ProgressDialog({ message, onConfirm, cancelable, onCancel, ...props }) {
  return (
    <Dialog onCancel={cancelable ? onCancel : null} {...props}>
      <ProgressContainer>
        <ProgressMessage>{message}</ProgressMessage>
        <ProgressBar />
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
