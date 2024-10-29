import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FilePlus01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M16.667 8.75V5.667c0-1.4 0-2.1-.272-2.635a2.5 2.5 0 0 0-1.093-1.093c-.534-.272-1.235-.272-2.635-.272H7.334c-1.4 0-2.1 0-2.635.272a2.5 2.5 0 0 0-1.093 1.093c-.272.535-.272 1.235-.272 2.635v8.667c0 1.4 0 2.1.272 2.635A2.5 2.5 0 0 0 4.7 18.06c.535.273 1.235.273 2.635.273h2.667m5-.834v-5M12.5 15h5"
    />
  </svg>
)
const ForwardRef = forwardRef(FilePlus01Md)
export default ForwardRef
