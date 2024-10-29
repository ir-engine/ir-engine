import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LayersTwo01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m1.333 9.666 6.428 3.214c.088.044.131.066.177.075q.062.01.123 0c.046-.009.09-.03.177-.075l6.428-3.214M1.333 6.333l6.428-3.214c.088-.044.131-.066.177-.074a.3.3 0 0 1 .123 0c.046.008.09.03.177.074l6.428 3.214-6.428 3.214c-.087.044-.131.066-.177.074a.3.3 0 0 1-.123 0c-.046-.008-.09-.03-.177-.074z"
    />
  </svg>
)
const ForwardRef = forwardRef(LayersTwo01Sm)
export default ForwardRef
