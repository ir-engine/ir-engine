import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CogSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="m6.264 12.914.39.876a1.475 1.475 0 0 0 2.696 0l.39-.876a1.62 1.62 0 0 1 1.646-.95l.953.102a1.474 1.474 0 0 0 1.348-2.334l-.564-.776A1.62 1.62 0 0 1 12.816 8c0-.343.109-.676.31-.953l.564-.775a1.474 1.474 0 0 0-1.348-2.335l-.953.101a1.617 1.617 0 0 1-1.647-.953L9.35 2.21a1.475 1.475 0 0 0-2.697 0l-.39.877a1.62 1.62 0 0 1-1.646.952l-.956-.101a1.475 1.475 0 0 0-1.348 2.335l.564.775a1.62 1.62 0 0 1 0 1.905l-.564.776a1.474 1.474 0 0 0 1.348 2.335l.953-.102a1.62 1.62 0 0 1 1.65.953" />
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(CogSm)
export default ForwardRef
