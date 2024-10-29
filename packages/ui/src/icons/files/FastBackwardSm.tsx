import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FastBackwardSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M14.667 10.958c0 .753 0 1.13-.153 1.315a.67.67 0 0 1-.54.242c-.238-.01-.52-.26-1.083-.76L9.563 8.797c-.31-.276-.465-.414-.522-.576a.67.67 0 0 1 0-.442c.057-.163.212-.3.522-.576l3.328-2.958c.563-.501.845-.751 1.084-.76a.67.67 0 0 1 .54.242c.151.185.151.561.151 1.315zM7.333 10.958c0 .753 0 1.13-.152 1.315a.67.67 0 0 1-.54.242c-.239-.01-.52-.26-1.083-.76L2.23 8.797c-.31-.276-.465-.414-.522-.576a.67.67 0 0 1 0-.442c.057-.163.212-.3.522-.576l3.328-2.958c.563-.501.844-.751 1.084-.76a.67.67 0 0 1 .539.242c.152.185.152.561.152 1.315z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(FastBackwardSm)
export default ForwardRef
