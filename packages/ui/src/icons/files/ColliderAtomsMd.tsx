import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ColliderAtomsMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M14.263 12.799a17 17 0 0 1-.71.754c-3.58 3.58-8.065 4.899-10.017 2.946-1.339-1.338-1.14-3.867.271-6.479m1.935-2.749q.351-.4.74-.789c3.58-3.58 8.065-4.899 10.017-2.946 1.34 1.34 1.14 3.87-.274 6.484m-2.672-3.538c3.58 3.58 4.899 8.065 2.946 10.017-1.952 1.953-6.437.634-10.017-2.946S1.583 5.488 3.536 3.536c1.952-1.953 6.437-.634 10.017 2.946M10.833 10a.833.833 0 1 1-1.666 0 .833.833 0 0 1 1.667 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ColliderAtomsMd)
export default ForwardRef
