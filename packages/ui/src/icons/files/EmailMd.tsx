import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const EmailMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 21 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17.667 6.482v7.036c0 .833-.723 1.508-1.615 1.508H5.282c-.892 0-1.615-.675-1.615-1.508V6.482m14 0c0-.832-.723-1.507-1.615-1.507H5.282c-.892 0-1.615.675-1.615 1.507m14 0v.163c0 .524-.291 1.01-.769 1.284l-5.384 3.093a1.71 1.71 0 0 1-1.694 0L4.436 7.929a1.49 1.49 0 0 1-.769-1.284v-.163"
    />
  </svg>
)
const ForwardRef = forwardRef(EmailMd)
export default ForwardRef
