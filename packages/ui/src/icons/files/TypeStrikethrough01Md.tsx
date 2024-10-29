import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TypeStrikethrough01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M4.333 5.833V5c0-.451.18-.86.47-1.16M8.5 16.667h5M11 10v6.667M3.5 2.5l15 15M8.917 3.333h6.25c.776 0 1.164 0 1.47.127.41.17.734.494.903.902.127.306.127.695.127 1.471M11 3.333v2.084"
    />
  </svg>
)
const ForwardRef = forwardRef(TypeStrikethrough01Md)
export default ForwardRef
