import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PlayMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M4.166 4.158c0-.81 0-1.214.169-1.437a.83.83 0 0 1 .615-.33c.279-.016.616.208 1.289.657l8.763 5.842c.556.371.834.557.931.79a.83.83 0 0 1 0 .639c-.097.234-.375.419-.931.79l-8.763 5.842c-.673.449-1.01.673-1.29.657a.83.83 0 0 1-.614-.33c-.169-.223-.169-.627-.169-1.436z"
    />
  </svg>
)
const ForwardRef = forwardRef(PlayMd)
export default ForwardRef
