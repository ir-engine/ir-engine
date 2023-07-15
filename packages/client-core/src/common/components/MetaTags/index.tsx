/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { Component, createContext, ReactNode, useEffect } from 'react'
import { createRoot, Root } from 'react-dom/client'

import {
  appendChild,
  getDuplicateCanonical,
  getDuplicateElementById,
  getDuplicateMeta,
  getDuplicateTitle,
  removeChild
} from './utils'

/**
 * This component is taken from https://github.com/s-yadav/react-meta-tags
 * Here we fixed breaking changes introduced due to react 18
 */

type MetaContextType = {
  extract?: (children: ReactNode | undefined) => void
}

const MetaContext = createContext<MetaContextType>({})

type AppWithCallbackProps = {
  children: ReactNode
  element: HTMLDivElement
  lastChildStr: string
  onLastChildStr: (lastChildStr: string) => void
}

const AppWithCallback = ({ children, element, lastChildStr, onLastChildStr }: AppWithCallbackProps) => {
  useEffect(() => {
    const childStr = element.innerHTML

    //if html is not changed return
    if (lastChildStr === childStr) {
      return
    }

    onLastChildStr(childStr)

    const tempHead = element.querySelector('.react-head-temp')

    // .react-head-temp might not exist when triggered from async action
    if (tempHead === null) {
      return
    }

    let childNodes = Array.prototype.slice.call(tempHead.children)

    const head = document.head
    const headHtml = head.innerHTML

    //filter children remove if children has not been changed
    childNodes = childNodes.filter((child) => {
      return headHtml.indexOf(child.outerHTML) === -1
    })

    //create clone of childNodes
    childNodes = childNodes.map((child) => child.cloneNode(true))

    //remove duplicate title and meta from head
    childNodes.forEach((child) => {
      const tag = child.tagName.toLowerCase()
      if (tag === 'title') {
        const title = getDuplicateTitle()
        if (title) removeChild(head, title)
      } else if (child.id) {
        // if the element has id defined remove the existing element with that id
        const elm = getDuplicateElementById(child)
        if (elm) removeChild(head, elm)
      } else if (tag === 'meta') {
        const meta = getDuplicateMeta(child)
        if (meta) removeChild(head, meta)
      } else if (tag === 'link' && child.rel === 'canonical') {
        const link = getDuplicateCanonical()
        if (link) removeChild(head, link)
      }
    })

    appendChild(document.head, childNodes)
  })

  return <>{children}</>
}

type Props = {
  children?: ReactNode | undefined
}

/** An wrapper component to wrap element which need to shifted to head **/
class MetaTags extends Component<Props> {
  static contextType = MetaContext
  temporaryElement: HTMLDivElement
  temporaryRoot: Root
  lastChildStr: string

  componentDidMount() {
    this.temporaryElement = document.createElement('div')
    this.temporaryRoot = createRoot(this.temporaryElement)
    this.handleChildrens()
  }
  componentDidUpdate(oldProps) {
    if (oldProps.children !== this.props.children) {
      this.handleChildrens()
    }
  }
  componentWillUnmount() {
    if (this.temporaryRoot) {
      this.temporaryRoot.unmount()
    }
  }
  extractChildren() {
    const { extract } = this.context as MetaContextType
    const { children } = this.props

    if (!children) {
      return
    }

    if (extract) {
      extract(children)
    }
  }
  handleChildrens() {
    const { children } = this.props
    if ((this.context as MetaContextType).extract || !children) {
      return
    }

    const headComponent = <div className="react-head-temp">{children}</div>

    this.temporaryRoot.render(
      <AppWithCallback
        element={this.temporaryElement}
        lastChildStr={this.lastChildStr}
        onLastChildStr={(lastChildStr) => (this.lastChildStr = lastChildStr)}
      >
        {headComponent}
      </AppWithCallback>
    )
  }
  render() {
    this.extractChildren()
    return null
  }
}

export default MetaTags
