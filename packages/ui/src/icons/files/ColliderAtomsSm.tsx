import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ColliderAtomsSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.412 10.24q-.27.305-.568.603C7.98 13.707 4.392 14.762 2.83 13.2c-1.071-1.071-.912-3.094.217-5.184m1.547-2.199q.282-.32.593-.631c2.864-2.864 6.452-3.92 8.014-2.357 1.071 1.071.911 3.097-.22 5.187m-2.137-2.83c2.864 2.864 3.919 6.452 2.357 8.014s-5.15.507-8.014-2.357S1.267 4.39 2.83 2.829s5.15-.507 8.014 2.357M8.668 8a.667.667 0 1 1-1.333 0 .667.667 0 0 1 1.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ColliderAtomsSm)
export default ForwardRef
