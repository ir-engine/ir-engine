import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PieChart02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} clipPath="url(#prefix__a)">
      <path d="M11.466 9.333c.185 0 .277 0 .352.041.062.034.12.098.147.162.033.079.025.163.008.33a5.33 5.33 0 0 1-6.347 4.698 5.333 5.333 0 0 1 .508-10.537c.167-.017.25-.026.33.008a.35.35 0 0 1 .161.146c.041.075.041.168.041.352V8.8c0 .187 0 .28.037.351a.33.33 0 0 0 .145.146c.072.036.165.036.352.036zM9.333 1.867c0-.185 0-.277.041-.352a.35.35 0 0 1 .162-.147c.079-.033.162-.025.33-.008a5.33 5.33 0 0 1 4.774 4.774c.016.167.025.25-.008.33a.35.35 0 0 1-.147.162c-.075.04-.167.04-.352.04H9.866c-.186 0-.28 0-.351-.036a.33.33 0 0 1-.146-.145c-.036-.072-.036-.165-.036-.352z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PieChart02Sm)
export default ForwardRef
