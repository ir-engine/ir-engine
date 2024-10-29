import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CubeOutlineSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m6.5 13.834.982.545c.189.105.284.158.384.178q.134.028.268 0c.1-.02.195-.073.384-.178l.982-.545m-6-1.667-.951-.528c-.2-.111-.3-.167-.373-.246a.7.7 0 0 1-.142-.242C2 11.049 2 10.935 2 10.706V9.667m0-3.333v-1.04c0-.228 0-.342.034-.444a.7.7 0 0 1 .142-.242c.073-.08.173-.135.373-.246l.951-.528m3-1.667.982-.545c.189-.106.284-.158.384-.179a.7.7 0 0 1 .268 0c.1.021.195.073.384.178l.982.546m3 1.667.951.528c.2.111.3.167.373.246q.097.106.142.242c.034.102.034.216.034.445v1.039m0 3.333v1.04c0 .227 0 .342-.034.444a.7.7 0 0 1-.142.242c-.073.08-.173.135-.373.245l-.951.529m-6-5L8 8m0 0 1.5-.833M8 8v1.667m-6-5 1.5.833m9 0 1.5-.833M8 13v1.667"
    />
  </svg>
)
const ForwardRef = forwardRef(CubeOutlineSm)
export default ForwardRef
