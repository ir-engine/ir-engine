import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Hexagon01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M9.352 2.027c.237-.131.355-.197.48-.223a.8.8 0 0 1 .336 0c.125.026.243.092.48.223l6.166 3.426c.25.138.375.208.465.306q.122.133.179.304c.042.127.042.27.042.555v6.765c0 .285 0 .428-.042.555a.8.8 0 0 1-.178.303c-.091.1-.216.168-.466.307l-6.166 3.426c-.237.131-.355.197-.48.223a.8.8 0 0 1-.336 0c-.125-.026-.243-.092-.48-.223l-6.166-3.426c-.25-.139-.375-.208-.465-.306a.8.8 0 0 1-.179-.304c-.042-.127-.042-.27-.042-.555V6.618c0-.285 0-.428.042-.555a.8.8 0 0 1 .179-.304c.09-.098.215-.168.465-.306z"
    />
  </svg>
)
const ForwardRef = forwardRef(Hexagon01Md)
export default ForwardRef
