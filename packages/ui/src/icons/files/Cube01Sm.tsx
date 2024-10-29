import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Cube01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M13.667 4.852 8 8m0 0L2.333 4.852M8 8v6.334m6-3.628V5.295c0-.229 0-.343-.034-.445a.7.7 0 0 0-.142-.242c-.073-.08-.173-.135-.373-.246l-4.933-2.74c-.189-.106-.284-.158-.384-.179a.7.7 0 0 0-.268 0c-.1.021-.195.073-.384.178L2.549 4.363c-.2.111-.3.167-.373.246a.7.7 0 0 0-.142.242C2 4.952 2 5.066 2 5.295v5.411c0 .229 0 .343.034.445q.045.136.142.242c.073.08.173.135.373.245l4.933 2.741c.189.105.284.158.384.178q.134.028.268 0c.1-.02.195-.073.384-.178l4.933-2.74c.2-.111.3-.167.373-.246a.7.7 0 0 0 .142-.242c.034-.102.034-.216.034-.445"
    />
  </svg>
)
const ForwardRef = forwardRef(Cube01Sm)
export default ForwardRef
