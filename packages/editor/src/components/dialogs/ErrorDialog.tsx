import React from 'react'
import styled from 'styled-components'

import Dialog, { DialogContent } from './Dialog'

/**
 * ErrorDialogContainer used as wrapper element for ErrorMessage.
 *
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
 * @type {Styled component}
 */
const ErrorMessage = styled.code`
  white-space: pre-wrap;
  overflow-wrap: break-word;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  color: var(--red);
`

/**
 * ErrorDialog is used to render error message.
 *
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
