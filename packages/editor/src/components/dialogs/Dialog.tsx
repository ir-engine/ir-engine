import React, { useCallback } from 'react'
import { Button, SecondaryButton } from '../inputs/Button'
import styled from 'styled-components'

/**
 * DialogContainer used as container element for DialogHeader, DialogContent and DialogBottomNav.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const DialogContainer = (styled as any).form`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background-color: #282c31;
  max-width: 800px;
  min-width: 400px;
  min-height: 150px;
  max-height: 80vh;
`

/**
 * DialogHeader used for providing styles to header text.
 *
 * @author Robert Long
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

  > * {
    display: flex;
    align-items: center;
  }
`

/**
 * DialogContent used to provide styles for dialog body content.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const DialogContent = (styled as any).div`
  color: ${(props) => props.theme.text2};
  display: flex;
  flex: 1;
  flex-direction: row;
  /* This forces firefox to give the contents a proper height. */
  overflow: hidden;
  padding: 8px;
  min-height: 100px;

  h1 {
    font-size: 2em;
    color: ${(props) => props.theme.text};
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
 * @author Robert Long
 * @type {Styled component}
 */
const DialogBottomNav = (styled as any).div`
  display: flex;
  height: 64px;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  background-color: black;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  padding: 8px;

  a {
    color: ${(props) => props.theme.text2};
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
 * @author Robert Long
 * @type {Props}
 */
interface Props {
  tag?
  title?
  onCancel?
  cancelLabel?
  onConfirm?
  confirmLabel?
  bottomNav?
  children?
}

/**
 * Dialog used to render view for Dialog which contains form.
 *
 * @author Robert Long
 * @param  {Props}
 * @constructor
 */
export function Dialog(props: Props) {
  // initializing component properties using props.
  const { tag, title, onCancel, cancelLabel, onConfirm, confirmLabel, bottomNav, children, ...rest } = props

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
    <DialogContainer as={tag} onSubmit={onSubmitForm} {...rest}>
      <DialogHeader>
        <span>{title}</span>
      </DialogHeader>
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
