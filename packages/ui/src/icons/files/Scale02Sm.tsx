import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Scale02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10.667 14h.133c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C14 12.48 14 11.92 14 10.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C12.48 2 11.92 2 10.8 2H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 3.52 2 4.08 2 5.2v.133m5.667 3 3.666-3.666m0 0H8m3.333 0V8m-7.2 6h1.734c.746 0 1.12 0 1.405-.145.25-.128.455-.332.583-.583C8 12.987 8 12.613 8 11.867v-1.734c0-.746 0-1.12-.145-1.405a1.33 1.33 0 0 0-.583-.583C6.987 8 6.613 8 5.867 8H4.133c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583C2 9.013 2 9.387 2 10.133v1.734c0 .746 0 1.12.145 1.405.128.25.332.455.583.583.285.145.659.145 1.405.145"
    />
  </svg>
)
const ForwardRef = forwardRef(Scale02Sm)
export default ForwardRef
