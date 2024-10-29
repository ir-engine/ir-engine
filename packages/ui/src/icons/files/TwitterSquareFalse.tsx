import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TwitterSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M48 0H0v48h48zM37.338 19.052q0-.45-.015-.9a13.6 13.6 0 0 0 3.17-3.556 11.9 11.9 0 0 1-3.652 1.076c1.315-.845 2.322-2.194 2.798-3.802-1.23.79-2.589 1.363-4.04 1.663-1.158-1.336-2.81-2.167-4.638-2.167-3.511 0-6.358 3.08-6.358 6.882 0 .531.056 1.063.164 1.567-5.282-.287-9.968-3.026-13.103-7.196a7.3 7.3 0 0 0-.863 3.462c0 2.385 1.123 4.497 2.83 5.737a6.16 6.16 0 0 1-2.882-.859v.082c0 3.34 2.193 6.119 5.104 6.746a5.7 5.7 0 0 1-1.676.245q-.615 0-1.199-.123c.81 2.726 3.159 4.729 5.94 4.77-2.175 1.853-4.918 2.957-7.896 2.957-.513 0-1.018-.04-1.515-.095 2.813 1.949 6.153 3.093 9.745 3.093 11.692 0 18.086-10.493 18.086-19.582"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(TwitterSquareFalse)
export default ForwardRef
