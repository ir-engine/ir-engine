import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ColliderAtomsLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
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
      d="M17.116 15.358q-.406.459-.851.906c-4.296 4.295-9.678 5.878-12.021 3.535-1.607-1.606-1.368-4.641.325-7.775m2.322-3.299q.422-.48.888-.947C12.075 3.482 17.457 1.9 19.8 4.243c1.607 1.607 1.367 4.645-.33 7.781m-3.205-4.246c4.295 4.296 5.878 9.678 3.535 12.021s-7.725.76-12.02-3.535C3.482 11.968 1.9 6.586 4.243 4.243s7.725-.76 12.02 3.535M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ColliderAtomsLg)
export default ForwardRef
