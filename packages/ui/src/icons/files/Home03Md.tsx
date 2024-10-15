import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Home03Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M7.5 17.5v-6.167c0-.466 0-.7.091-.878a.83.83 0 0 1 .364-.364C8.134 10 8.367 10 8.834 10h2.333c.467 0 .7 0 .878.09.157.08.285.208.364.365.091.178.091.412.091.878V17.5M1.667 7.917 9.2 2.267c.287-.216.43-.323.588-.365a.83.83 0 0 1 .425 0c.157.042.3.15.587.365l7.534 5.65m-15-1.25v8.166c0 .934 0 1.4.181 1.757.16.314.415.569.729.728.356.182.823.182 1.756.182h8c.934 0 1.4 0 1.757-.182.314-.16.569-.414.728-.728.182-.357.182-.823.182-1.757V6.667l-5.067-3.8c-.573-.43-.86-.646-1.175-.729a1.67 1.67 0 0 0-.849 0c-.315.083-.602.298-1.176.729z"
    />
  </svg>
)
const ForwardRef = forwardRef(Home03Md)
export default ForwardRef
