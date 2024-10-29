import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Type01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M3.666 4.667c0-.621 0-.932.102-1.177.135-.327.394-.586.721-.722.245-.101.556-.101 1.177-.101h6.667c.62 0 .932 0 1.177.101.326.136.586.395.721.722.102.245.102.556.102 1.177m-7.334 8.667h4M9 2.667v10.667"
    />
  </svg>
)
const ForwardRef = forwardRef(Type01Sm)
export default ForwardRef
