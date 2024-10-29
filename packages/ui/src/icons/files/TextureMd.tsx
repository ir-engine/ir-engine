import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TextureMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M1.666 5c.5.417 1 .834 2.083.834 2.084 0 2.084-1.667 4.167-1.667 1.083 0 1.583.417 2.083.833.5.417 1 .834 2.084.834 2.083 0 2.083-1.667 4.166-1.667 1.084 0 1.584.417 2.084.833M1.666 15c.5.417 1 .834 2.083.834 2.084 0 2.084-1.667 4.167-1.667 1.083 0 1.583.417 2.083.833.5.417 1 .834 2.084.834 2.083 0 2.083-1.667 4.166-1.667 1.084 0 1.584.417 2.084.833M1.666 10c.5.417 1 .834 2.083.834 2.084 0 2.084-1.667 4.167-1.667 1.083 0 1.583.417 2.083.833.5.417 1 .834 2.084.834 2.083 0 2.083-1.667 4.166-1.667 1.084 0 1.584.417 2.084.833"
    />
  </svg>
)
const ForwardRef = forwardRef(TextureMd)
export default ForwardRef
