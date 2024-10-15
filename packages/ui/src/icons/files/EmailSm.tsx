import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const EmailSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 17 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.667 4.985v6.03c0 .714-.62 1.293-1.385 1.293h-9.23c-.765 0-1.385-.579-1.385-1.293v-6.03m12 0c0-.714-.62-1.293-1.385-1.293h-9.23c-.765 0-1.385.579-1.385 1.293m12 0v.14c0 .448-.25.864-.659 1.1l-4.615 2.65a1.47 1.47 0 0 1-1.452 0l-4.615-2.65a1.28 1.28 0 0 1-.659-1.1v-.14"
    />
  </svg>
)
const ForwardRef = forwardRef(EmailSm)
export default ForwardRef
