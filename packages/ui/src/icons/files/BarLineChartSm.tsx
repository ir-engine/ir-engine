import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const BarLineChartSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.334 13.333V8.667M8 13.333V6.667m-5.333 6.666v-2.666m6.271-7.315 3.446 1.292M7.2 3.6 3.467 6.4m10.574-2.107a1 1 0 1 1-1.415 1.414 1 1 0 0 1 1.415-1.414m-10.667 2A1 1 0 1 1 1.96 7.707a1 1 0 0 1 1.414-1.414m5.333-4a1 1 0 1 1-1.414 1.414 1 1 0 0 1 1.414-1.414"
    />
  </svg>
)
const ForwardRef = forwardRef(BarLineChartSm)
export default ForwardRef
