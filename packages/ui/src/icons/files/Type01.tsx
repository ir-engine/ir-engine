import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Type01 = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M4.334 5.833c0-.777 0-1.165.127-1.471.169-.409.493-.733.902-.902.306-.127.694-.127 1.471-.127h8.333c.777 0 1.165 0 1.472.127.408.169.732.493.902.902.126.306.126.694.126 1.471M8.501 16.666h5M11 3.333v13.333"
    />
  </svg>
)
const ForwardRef = forwardRef(Type01)
export default ForwardRef
