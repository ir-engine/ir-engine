import React from 'react'
import { Entity } from 'aframe-react'
import { useRouter } from 'next/router'
import isExternalUrl from '../../../../shared/utils/isExternalUrl'

type makeHandleClickType = {
  href: string
  router: any
}
// TODO: implement long-press instead of click, for entering portals
const makeHandleClick = ({ href, router }: makeHandleClickType) => {
  const handleClick = (e: CustomEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isExternalUrl(href)) {
      window.location.href = href
    } else {
      router.push(href)
    }
  }
  return handleClick
}

type PortalProps = {
  href: string
  position: { x: number; y: number; z: number }
}

const Portal = ({ href, position }: PortalProps) => {
  const router = useRouter()
  return (
    <Entity
      className="portal"
      primitive="a-link"
      // use title instead of href, to ensure page navigation doesn't occur
      // so that we can use custom navigation logic, with next/router
      // ensuring the entire page doesn't reload on using the portal.
      // note: we need to use a customized aframe source-code to only navigate if
      // href exists in order for this solution to work.
      title={href}
      events={{
        click: makeHandleClick({ href, router })
      }}
      position={position}
    />
  )
}
export default Portal
