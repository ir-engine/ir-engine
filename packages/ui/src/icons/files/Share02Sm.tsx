import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Share02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.667 7.333c-.62 0-.93 0-1.185.068a2 2 0 0 0-1.414 1.415C2 9.07 2 9.38 2 10v.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C3.52 14 4.08 14 5.2 14h5.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C14 12.48 14 11.92 14 10.8V10c0-.62 0-.93-.068-1.184A2 2 0 0 0 12.518 7.4c-.255-.068-.565-.068-1.185-.068m-.666-2.666L8 2m0 0L5.333 4.667M8 2v8"
    />
  </svg>
)
const ForwardRef = forwardRef(Share02Sm)
export default ForwardRef
