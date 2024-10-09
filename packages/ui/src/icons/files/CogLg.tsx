import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CogLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="m9.395 19.371.585 1.315a2.212 2.212 0 0 0 4.044 0l.584-1.315a2.43 2.43 0 0 1 2.47-1.423l1.43.152a2.212 2.212 0 0 0 2.023-3.502l-.847-1.164a2.43 2.43 0 0 1-.46-1.434c0-.513.163-1.014.464-1.429l.847-1.163a2.211 2.211 0 0 0-2.022-3.502l-1.43.152a2.43 2.43 0 0 1-1.47-.312 2.43 2.43 0 0 1-1-1.117l-.589-1.315a2.212 2.212 0 0 0-4.044 0L9.395 4.63c-.207.468-.557.86-1 1.117-.445.256-.96.365-1.47.312l-1.434-.152a2.212 2.212 0 0 0-2.023 3.502l.847 1.163a2.43 2.43 0 0 1 0 2.858l-.847 1.163a2.21 2.21 0 0 0 .786 3.273c.382.195.811.274 1.237.23l1.43-.153a2.43 2.43 0 0 1 2.474 1.43" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(CogLg)
export default ForwardRef
