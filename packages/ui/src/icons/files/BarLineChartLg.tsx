import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const BarLineChartLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 20v-7m-8 7V10M4 20v-4m9.407-10.972 5.168 1.938M10.8 5.4 5.2 9.6m15.86-3.16a1.5 1.5 0 1 1-2.121 2.12 1.5 1.5 0 0 1 2.122-2.12m-16 3a1.5 1.5 0 1 1-2.12 2.12 1.5 1.5 0 0 1 2.12-2.12m8-6a1.5 1.5 0 1 1-2.121 2.12 1.5 1.5 0 0 1 2.122-2.12"
    />
  </svg>
)
const ForwardRef = forwardRef(BarLineChartLg)
export default ForwardRef
