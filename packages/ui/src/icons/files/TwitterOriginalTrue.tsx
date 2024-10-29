import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TwitterOriginalTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      fill="#1EA1F2"
      fillRule="evenodd"
      d="M39.543 16.177q.02.525.018 1.05c0 10.604-7.46 22.846-21.1 22.846-4.19 0-8.087-1.336-11.37-3.609.58.064 1.17.111 1.768.111 3.474 0 6.674-1.288 9.213-3.45-3.245-.048-5.986-2.385-6.93-5.564q.68.143 1.398.143a6.7 6.7 0 0 0 1.955-.286c-3.396-.732-5.954-3.975-5.954-7.87v-.095c1 .588 2.146.953 3.363 1C9.91 19.008 8.6 16.544 8.6 13.762c0-1.463.365-2.846 1.007-4.039 3.657 4.865 9.124 8.061 15.287 8.395a8.7 8.7 0 0 1-.191-1.828c0-4.436 3.32-8.03 7.417-8.03 2.133 0 4.06.97 5.412 2.529a13.9 13.9 0 0 0 4.713-1.94c-.556 1.876-1.73 3.45-3.265 4.436 1.501-.191 2.933-.62 4.261-1.256a15.9 15.9 0 0 1-3.699 4.15"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(TwitterOriginalTrue)
export default ForwardRef
