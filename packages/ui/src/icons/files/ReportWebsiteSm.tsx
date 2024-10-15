import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ReportWebsiteSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.667 6.666H1.334M14.667 8V5.466c0-.746 0-1.12-.145-1.405a1.33 1.33 0 0 0-.583-.583c-.285-.145-.658-.145-1.405-.145H3.467c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583-.145.285-.145.659-.145 1.405v5.067c0 .747 0 1.12.145 1.405.128.251.332.455.583.583.285.145.659.145 1.405.145h4.534M12 10v2m0 2h.006"
    />
  </svg>
)
const ForwardRef = forwardRef(ReportWebsiteSm)
export default ForwardRef
