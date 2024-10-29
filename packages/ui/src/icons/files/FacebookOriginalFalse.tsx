import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FacebookOriginalFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#080808"
      fillRule="evenodd"
      d="M6 24c0 8.9 6.5 16.3 15 17.8l.1-.08-.1-.02V29h-4.5v-5H21v-4c0-4.5 2.9-7 7-7 1.3 0 2.7.2 4 .4V18h-2.3c-2.2 0-2.7 1.1-2.7 2.5V24h4.8l-.8 5h-4v12.7l-.1.02.1.08c8.5-1.5 15-8.9 15-17.8 0-9.9-8.1-18-18-18S6 14.1 6 24"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(FacebookOriginalFalse)
export default ForwardRef
