import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Share06Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17.326 10.506c.204-.174.305-.261.343-.365a.42.42 0 0 0 0-.282c-.038-.104-.14-.19-.343-.365l-7.059-6.05c-.35-.3-.525-.45-.673-.455a.42.42 0 0 0-.334.154c-.093.115-.093.345-.093.806v3.58a8.055 8.055 0 0 0-6.667 7.93v.51a9.5 9.5 0 0 1 6.667-3.41v3.492c0 .46 0 .691.093.806.082.1.205.157.334.154.148-.004.323-.154.673-.454z"
    />
  </svg>
)
const ForwardRef = forwardRef(Share06Md)
export default ForwardRef
