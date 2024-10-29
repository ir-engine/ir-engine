import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const VolumeMinSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M12.163 5.334C12.691 6.09 13 7.009 13 8c0 .992-.31 1.911-.837 2.667M8.09 2.91 5.98 5.02a1.4 1.4 0 0 1-.241.214.7.7 0 0 1-.193.08c-.077.019-.158.019-.321.019H4.067c-.374 0-.56 0-.703.072a.67.67 0 0 0-.291.292C3 5.84 3 6.027 3 6.4v3.2c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073h1.158c.163 0 .244 0 .321.018a.7.7 0 0 1 .193.08c.067.041.125.1.24.214l2.11 2.11c.286.286.429.43.552.439a.33.33 0 0 0 .28-.116c.079-.094.079-.295.079-.7V3.289c0-.404 0-.606-.08-.7a.33.33 0 0 0-.28-.115c-.122.01-.265.152-.55.438"
    />
  </svg>
)
const ForwardRef = forwardRef(VolumeMinSm)
export default ForwardRef
