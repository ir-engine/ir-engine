import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Hexagon01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M11.223 2.431c.284-.157.425-.236.575-.267a1 1 0 0 1 .403 0c.15.03.292.11.576.267l7.4 4.111c.3.167.45.25.558.368a1 1 0 0 1 .215.364c.05.153.05.324.05.667v8.117c0 .343 0 .514-.05.667a1 1 0 0 1-.215.364c-.109.118-.258.201-.558.368l-7.4 4.11c-.284.159-.425.237-.575.268a1 1 0 0 1-.403 0c-.15-.03-.292-.11-.576-.267l-7.4-4.111c-.3-.167-.45-.25-.558-.368a1 1 0 0 1-.215-.364C3 16.572 3 16.4 3 16.058V7.941c0-.343 0-.514.05-.667a1 1 0 0 1 .215-.364c.109-.118.258-.201.558-.368z"
    />
  </svg>
)
const ForwardRef = forwardRef(Hexagon01Lg)
export default ForwardRef
