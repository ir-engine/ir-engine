import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Save01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 3v3.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C7.76 8 8.04 8 8.6 8h6.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C17 7.24 17 6.96 17 6.4V4m0 17v-6.4c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C16.24 13 15.96 13 15.4 13H8.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C7 13.76 7 14.04 7 14.6V21M21 9.325V16.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h6.875c.489 0 .733 0 .963.055.204.05.4.13.579.24.201.123.374.296.72.642l3.126 3.126c.346.346.519.519.642.72q.165.27.24.579c.055.23.055.474.055.963"
    />
  </svg>
)
const ForwardRef = forwardRef(Save01Lg)
export default ForwardRef
