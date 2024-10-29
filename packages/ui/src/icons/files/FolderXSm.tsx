import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FolderXSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m8.667 4.667-.743-1.488c-.214-.428-.321-.642-.481-.798a1.3 1.3 0 0 0-.498-.308C6.733 2 6.495 2 6.015 2H3.468c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583-.145.285-.145.659-.145 1.405v.534m0 0h10.133c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874c.218.428.218.988.218 2.108V10.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.427.218-.988.218-2.108.218H4.534c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874c-.218-.428-.218-.988-.218-2.108zm5 3L9.667 11m0-3.333L6.334 11"
    />
  </svg>
)
const ForwardRef = forwardRef(FolderXSm)
export default ForwardRef
