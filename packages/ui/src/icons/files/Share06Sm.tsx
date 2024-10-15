import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Share06Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.86 8.405c.164-.14.245-.21.275-.292a.33.33 0 0 0 0-.225c-.03-.083-.111-.153-.274-.293l-5.647-4.84c-.28-.24-.42-.36-.54-.363a.33.33 0 0 0-.266.122c-.075.092-.075.277-.075.646v2.863A6.444 6.444 0 0 0 2 12.368v.407a7.6 7.6 0 0 1 5.333-2.728v2.794c0 .369 0 .553.075.645.065.08.164.125.267.123.119-.003.259-.123.539-.364z"
    />
  </svg>
)
const ForwardRef = forwardRef(Share06Sm)
export default ForwardRef
