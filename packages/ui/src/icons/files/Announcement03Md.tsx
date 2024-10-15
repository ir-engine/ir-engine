import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Announcement03Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M15.417 13.333c1.61 0 2.917-2.425 2.917-5.416S17.028 2.5 15.417 2.5m0 10.833c-1.61 0-2.917-2.425-2.917-5.416S13.806 2.5 15.417 2.5m0 10.833-10.88-1.978c-.773-.14-1.16-.21-1.472-.364A2.5 2.5 0 0 1 1.762 9.43c-.095-.335-.095-.728-.095-1.513 0-.786 0-1.179.095-1.514a2.5 2.5 0 0 1 1.303-1.56c.312-.154.699-.224 1.472-.365L15.417 2.5m-11.25 9.167.328 4.595c.031.436.047.654.142.82.083.145.21.262.36.335.172.083.39.083.828.083H7.31c.5 0 .75 0 .936-.1a.83.83 0 0 0 .366-.395c.085-.193.066-.442.028-.94l-.306-3.982"
    />
  </svg>
)
const ForwardRef = forwardRef(Announcement03Md)
export default ForwardRef
