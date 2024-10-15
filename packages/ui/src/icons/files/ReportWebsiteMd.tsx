import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ReportWebsiteMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M18.333 8.334H1.666M18.333 10V6.834c0-.934 0-1.4-.182-1.757a1.67 1.67 0 0 0-.728-.728c-.357-.182-.824-.182-1.757-.182H4.333c-.934 0-1.4 0-1.757.182-.314.16-.569.414-.728.728-.182.357-.182.823-.182 1.757v6.333c0 .933 0 1.4.182 1.757.16.313.414.568.728.728.357.182.823.182 1.757.182h5.666m5-3.334V15m0 2.5h.009"
    />
  </svg>
)
const ForwardRef = forwardRef(ReportWebsiteMd)
export default ForwardRef
