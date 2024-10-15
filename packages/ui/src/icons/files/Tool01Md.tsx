import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Tool01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M13.026 6.36c-.33-.33-.495-.495-.557-.685a.84.84 0 0 1 0-.516c.062-.19.227-.355.557-.685L15.39 2.11a5 5 0 0 0-6.916 5.746c.1.407.149.611.14.74a.7.7 0 0 1-.092.326c-.059.115-.173.229-.4.456l-5.207 5.207a1.768 1.768 0 0 0 2.5 2.5l5.207-5.207c.227-.227.341-.341.456-.4a.7.7 0 0 1 .326-.092c.129-.009.333.04.74.14q.573.14 1.188.142a5 5 0 0 0 4.558-7.058l-2.365 2.365c-.33.33-.495.495-.686.557a.83.83 0 0 1-.515 0c-.19-.062-.355-.227-.685-.557z"
    />
  </svg>
)
const ForwardRef = forwardRef(Tool01Md)
export default ForwardRef
