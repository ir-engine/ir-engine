import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Edit01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.876 18.116c.046-.414.069-.62.131-.814a2 2 0 0 1 .234-.485c.111-.17.259-.317.553-.61L17 3a2.828 2.828 0 0 1 4 4L7.794 20.206c-.294.294-.442.441-.611.553a2 2 0 0 1-.485.233c-.193.063-.4.086-.814.132L2.5 21.5z"
    />
  </svg>
)
const ForwardRef = forwardRef(Edit01Lg)
export default ForwardRef
