import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ReportUserMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M10 12.917H6.25c-1.164 0-1.745 0-2.218.143a3.33 3.33 0 0 0-2.222 2.222c-.144.473-.144 1.055-.144 2.218m13.333-5.833V15m0 2.5h.009M12.083 6.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ReportUserMd)
export default ForwardRef
