import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const EyeLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="M2.42 12.713c-.136-.215-.204-.323-.242-.49a1.2 1.2 0 0 1 0-.446c.038-.167.106-.274.242-.49C3.546 9.505 6.895 5 12 5s8.455 4.505 9.58 6.287c.137.215.205.323.243.49.029.125.029.322 0 .446-.038.167-.106.274-.242.49C20.455 14.495 17.105 19 12 19c-5.106 0-8.455-4.505-9.58-6.287" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(EyeLg)
export default ForwardRef
