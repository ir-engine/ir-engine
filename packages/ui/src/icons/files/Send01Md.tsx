import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Send01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M8.75 11.25 17.5 2.5m-8.644 9.024 2.19 5.631c.193.496.29.744.428.817.12.063.264.063.385 0 .139-.072.236-.32.43-.816L17.78 3.083c.175-.448.262-.672.214-.815a.42.42 0 0 0-.263-.263c-.143-.048-.367.04-.814.214L2.843 7.711c-.495.194-.743.29-.816.43a.42.42 0 0 0 0 .384c.073.14.321.236.817.429l5.632 2.19a1 1 0 0 1 .193.089q.056.041.098.097c.03.043.05.093.089.194"
    />
  </svg>
)
const ForwardRef = forwardRef(Send01Md)
export default ForwardRef
