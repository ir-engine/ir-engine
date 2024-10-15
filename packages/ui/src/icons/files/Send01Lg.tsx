import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Send01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.5 13.5 21 3M10.627 13.828l2.628 6.758c.232.596.347.893.514.98a.5.5 0 0 0 .462 0c.167-.086.283-.384.515-.979L21.336 3.7c.21-.537.315-.805.258-.977a.5.5 0 0 0-.316-.316c-.172-.057-.44.048-.978.257L3.413 9.253c-.595.233-.893.349-.98.516a.5.5 0 0 0 0 .461c.087.167.385.283.98.515l6.759 2.628c.12.047.18.07.232.106a.5.5 0 0 1 .116.117c.037.051.06.111.107.232"
    />
  </svg>
)
const ForwardRef = forwardRef(Send01Lg)
export default ForwardRef
