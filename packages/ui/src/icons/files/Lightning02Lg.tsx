import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Lightning02Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 25"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.25 2.139H8.494c-.18 0-.27 0-.348.027a.5.5 0 0 0-.187.115c-.06.06-.1.14-.18.3l-4.2 8.4c-.192.383-.288.575-.265.73a.5.5 0 0 0 .208.337c.129.09.343.09.772.09H10.5l-3 10L19.693 9.495c.411-.427.617-.64.629-.822a.5.5 0 0 0-.177-.415c-.14-.118-.436-.118-1.028-.118h-7.118z"
    />
  </svg>
)
const ForwardRef = forwardRef(Lightning02Lg)
export default ForwardRef
