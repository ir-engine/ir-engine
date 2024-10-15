import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Tool01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.42 5.087c-.263-.264-.395-.396-.445-.548a.67.67 0 0 1 0-.412c.05-.152.182-.284.446-.548l1.892-1.892A4 4 0 0 0 6.78 6.284c.08.325.12.488.112.591a.6.6 0 0 1-.073.261c-.047.092-.138.183-.32.365l-4.166 4.165a1.414 1.414 0 0 0 2 2L8.5 9.501c.182-.182.273-.273.364-.32a.6.6 0 0 1 .261-.074c.103-.007.267.033.593.113q.457.112.95.113a4 4 0 0 0 3.646-5.646l-1.892 1.892c-.264.264-.396.396-.548.445a.67.67 0 0 1-.412 0c-.153-.05-.285-.181-.549-.445z"
    />
  </svg>
)
const ForwardRef = forwardRef(Tool01Sm)
export default ForwardRef
