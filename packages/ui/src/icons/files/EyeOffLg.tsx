import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const EyeOffLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.743 5.092Q11.353 5.001 12 5c5.105 0 8.455 4.505 9.58 6.287.137.215.205.323.243.49.029.125.029.322 0 .447-.038.166-.107.274-.244.492-.3.474-.757 1.141-1.363 1.865M6.724 6.715c-2.162 1.467-3.63 3.504-4.303 4.57-.137.217-.205.325-.243.492a1.2 1.2 0 0 0 0 .446c.038.167.106.274.242.49C3.546 14.495 6.895 19 12 19c2.059 0 3.832-.732 5.289-1.723M3 3l18 18M9.88 9.879a3 3 0 1 0 4.243 4.243"
    />
  </svg>
)
const ForwardRef = forwardRef(EyeOffLg)
export default ForwardRef
