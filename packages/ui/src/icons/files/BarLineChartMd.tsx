import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const BarLineChartMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M16.666 16.667v-5.834M10 16.667V8.333m-6.667 8.334v-3.334m7.839-9.143 4.307 1.615M8.999 4.5 4.333 8M17.55 5.366a1.25 1.25 0 1 1-1.767 1.768 1.25 1.25 0 0 1 1.767-1.768m-13.333 2.5a1.25 1.25 0 1 1-1.768 1.768 1.25 1.25 0 0 1 1.768-1.768m6.667-5a1.25 1.25 0 1 1-1.768 1.768 1.25 1.25 0 0 1 1.768-1.768"
    />
  </svg>
)
const ForwardRef = forwardRef(BarLineChartMd)
export default ForwardRef
