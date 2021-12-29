import React from 'react'

import Dialog, { DialogContent } from './Dialog'
import styled from 'styled-components'

/**
 * ErrorDialogContainer used as wrapper element for ErrorMessage.
 *
 * @author Robert Long
 * @param {any} styled
 * @type {Styled component}
 */
const ErrorDialogContainer = (styled as any)(Dialog)`
  max-width: 600px;

  ${DialogContent} {
    padding: 0;
  }
`

/**
 * ErrorMessage used to provide styles for error message content.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const ErrorMessage = (styled as any).code`
  white-space: pre-wrap;
  overflow-wrap: break-word;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  color: ${(props) => props.theme.red};
`

/**
 * ErrorDialog is used to render error message.
 *
 * @author Robert Long
 * @type {Object}
 */
export function ErrorDialog(props) {
  if (!props) return null
  return (
    <ErrorDialogContainer {...props}>
      <ErrorMessage>{props?.message}</ErrorMessage>
    </ErrorDialogContainer>
  )
}

export default ErrorDialog
