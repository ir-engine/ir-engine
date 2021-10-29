import React from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 *
 * @author Robert Long
 */
export const Portal = (props) => {
  let el = document.createElement('div')

  useEffect(() => {
    document.body.appendChild(el)
  }, [])

  useEffect(() => {
    try {
      if (el) {
        document.body.removeChild(el)
      }
    } catch (err) {
      console.warn(`Error removing Portal element: ${err}`)
    }
  }, null)

  return createPortal(props.children, el)
}

export default Portal
