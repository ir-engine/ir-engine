import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Share02Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 11c-.93 0-1.395 0-1.776.102a3 3 0 0 0-2.122 2.121C3 13.606 3 14.07 3 15v1.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 21 6.12 21 7.8 21h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C21 18.72 21 17.88 21 16.2V15c0-.93 0-1.395-.102-1.777a3 3 0 0 0-2.122-2.12C18.396 11 17.93 11 17 11m-1-4-4-4m0 0L8 7m4-4v12"
    />
  </svg>
)
const ForwardRef = forwardRef(Share02Lg)
export default ForwardRef
