import React from 'react'
import { createPortal } from 'react-dom'

/**
 *
 * @author Robert Long
 */
export class Portal extends React.Component {
  constructor(props) {
    super(props)
    this.el = document.createElement('div')
  }

  componentDidMount() {
    document.body.appendChild(this.el)
  }

  componentWillUnmount() {
    try {
      if (this.el) {
        document.body.removeChild(this.el)
      }
    } catch (err) {
      console.warn(`Error removing Portal element: ${err}`)
    }
  }

  el: HTMLDivElement

  render(): any {
    return createPortal(this.props.children, this.el)
  }
}

export default Portal
