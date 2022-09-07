import React, { useCallback } from 'react'
import styled from 'styled-components'

import { Button, SecondaryButton } from '../inputs/Button'

/**
 * DialogContainer used as container element for DialogHeader, DialogContent and DialogBottomNav.
 *
 * @type {Styled component}
 */
const DialogContainer = styled.form`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background-color: #282c31;
  max-width: 800px;
  min-width: 250px;
  min-height: 150px;
  max-height: 80vh;
`

/**
 * DialogHeader used for providing styles to header text.
 *
 * @type {Styled component}
 */
const DialogHeader = (styled as any).div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 12px;
  overflow: hidden;
  height: 32px;
  background: black;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  color: white;

  > * {
    display: flex;
    align-items: center;
  }
`

/**
 * DialogContent used to provide styles for dialog body content.
 *
 * @type {Styled component}
 */
export const DialogContent = (styled as any).div`
  color: var(--textColor);
  display: flex;
  flex: 1;
  flex-direction: row;
  /* This forces firefox to give the contents a proper height. */
  overflow: hidden;
  padding: 8px;
  min-height: 100px;

  h1 {
    font-size: 2em;
    color: var(--textColor);
    margin-bottom: 16px;
  }

  p {
    margin-bottom: 12px;
    line-height: 1.5em;
  }
`

/**
 * DialogBottomNav used to provide styles for bottom nav of Dialog component.
 *
 * @type {Styled component}
 */
const DialogBottomNav = (styled as any).div`
  padding: 8px;
  margin: auto;

  a {
    color: var(--textColor);
  }

  button {
    min-width: 84px;
  }

  & > * {
    margin: 0 8px;
  }
`

/**
 * declaring props for Dialog component.
 *
 * @type {Props}
 */
interface Props {
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
 * Dialog used to render view for Dialog which contains form.
 *
 * @param  {Props}
 * @constructor
 */
const Dialog = ({ tag, bottomNav, children, cancelLabel, confirmLabel, onCancel, onConfirm }: Props) => {
  // callback function used to handle form submit
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault()

      if (onConfirm) {
        onConfirm(e)
      }
    },
    [onConfirm]
  )
  const button = (
    <Button type="submit" onClick={tag === 'form' ? null : onConfirm}>
      {confirmLabel}
    </Button>
  )

  // returning view for Dialog component
  return (
    <DialogContainer as={tag} onSubmit={onSubmitForm}>
      <DialogContent>{children}</DialogContent>
      {(onConfirm || onCancel || bottomNav) && (
        <DialogBottomNav>
          {bottomNav}
          {onCancel && <SecondaryButton onClick={onCancel}>{cancelLabel || 'Cancel'}</SecondaryButton>}
          {onConfirm && button}
        </DialogBottomNav>
      )}
    </DialogContainer>
  )
}

export default Dialog
