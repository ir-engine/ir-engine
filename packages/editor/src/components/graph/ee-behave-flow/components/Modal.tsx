import React from 'react'
import { FC, PropsWithChildren } from 'react'

import { useOnPressKey } from '../hooks/useOnPressKey'
import styles from '../styles.module.scss'

export type ModalAction = {
  label: string
  onClick: () => void
}

export type ModalProps = {
  open?: boolean
  onClose: () => void
  title: string
  actions: ModalAction[]
}

export const Modal: FC<PropsWithChildren<ModalProps>> = ({ open = false, onClose, title, children, actions }) => {
  useOnPressKey('Escape', onClose)

  if (open === false) return null

  const actionColors = {
    primary: styles.primary,
    secondary: styles.secondary
  }

  return (
    <>
      <div className={styles.modalExit} onClick={onClose}></div>
      <div className={styles.Modal}>
        <div className={styles.title}>
          <h2>{title}</h2>
        </div>
        <div className={styles.children}>{children}</div>
        <div className={styles.actions}>
          {actions.map((action, ix) => (
            <button
              key={ix}
              className={
                'cursor-pointer ' + (ix === actions.length - 1 ? actionColors.primary : actionColors.secondary)
              }
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
