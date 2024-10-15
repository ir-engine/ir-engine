import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PieChart02Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="M17.2 14c.277 0 .416 0 .528.062a.53.53 0 0 1 .22.243c.05.118.037.243.012.494A8 8 0 1 1 9.201 6.04c.251-.025.376-.038.494.012a.53.53 0 0 1 .243.22c.062.113.062.251.062.528v6.4c0 .28 0 .42.055.527a.5.5 0 0 0 .218.219c.107.054.247.054.527.054zM14 2.8c0-.277 0-.415.062-.528a.53.53 0 0 1 .243-.22c.117-.05.243-.037.494-.012a8 8 0 0 1 7.161 7.161c.025.251.038.377-.012.494a.53.53 0 0 1-.22.244c-.113.061-.251.061-.528.061h-6.4c-.28 0-.42 0-.527-.054a.5.5 0 0 1-.218-.219C14 9.62 14 9.48 14 9.2z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(PieChart02Lg)
export default ForwardRef
