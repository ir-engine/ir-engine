import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const GoogleOriginalFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M30.273 16.304c-1.745-1.685-3.964-2.543-6.436-2.543-4.385 0-8.097 2.99-9.421 7.009a10.3 10.3 0 0 0-.528 3.23c0 1.12.191 2.21.528 3.23 1.324 4.018 5.035 7.009 9.42 7.009 2.266 0 4.195-.603 5.702-1.623a7.83 7.83 0 0 0 3.36-5.13h-9.061v-6.577h15.857c.199 1.113.306 2.272.306 3.477 0 5.178-1.837 9.536-5.02 12.495C32.194 39.478 28.383 41 23.837 41c-6.582 0-12.276-3.81-15.046-9.365A17.1 17.1 0 0 1 7 24c0-2.743.65-5.34 1.79-7.634C11.562 10.81 17.256 7 23.838 7c4.538 0 8.35 1.685 11.265 4.428z"
    />
  </svg>
)
const ForwardRef = forwardRef(GoogleOriginalFalse)
export default ForwardRef
