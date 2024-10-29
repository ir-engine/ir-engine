import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LayersThree02Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M7 9.5 2 12l9.642 4.82c.131.066.197.1.266.112q.091.016.184 0c.069-.013.135-.046.266-.111L22 12l-5-2.5m-10 5L2 17l9.642 4.82c.131.066.197.1.266.112q.091.016.184 0c.069-.013.135-.046.266-.111L22 17l-5-2.5M2 7l9.642-4.822c.131-.065.197-.098.266-.11a.5.5 0 0 1 .184 0c.069.012.135.045.266.11L22 7l-9.642 4.82a1 1 0 0 1-.266.112.5.5 0 0 1-.184 0c-.069-.013-.135-.046-.266-.111z"
    />
  </svg>
)
const ForwardRef = forwardRef(LayersThree02Lg)
export default ForwardRef
