import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Pin02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m5.584 10.411-3.77 3.771m5.982-9.754-1.04 1.04a1.4 1.4 0 0 1-.176.162.7.7 0 0 1-.138.073c-.055.022-.114.034-.231.057l-2.443.489c-.635.127-.953.19-1.101.358a.67.67 0 0 0-.162.534c.03.221.26.45.718.908l4.723 4.724c.458.458.687.687.909.717a.67.67 0 0 0 .534-.161c.167-.149.23-.466.358-1.101l.488-2.443c.024-.118.036-.177.057-.232a.7.7 0 0 1 .074-.138c.034-.048.076-.09.16-.175l1.042-1.04c.054-.055.08-.082.11-.106a1 1 0 0 1 .085-.057c.033-.019.068-.034.139-.064l1.663-.713c.485-.208.727-.312.837-.48a.67.67 0 0 0 .096-.498c-.04-.197-.226-.383-.6-.756l-3.428-3.43c-.373-.372-.56-.559-.757-.599a.67.67 0 0 0-.498.096c-.168.11-.272.353-.48.838l-.713 1.663c-.03.07-.045.106-.064.139a1 1 0 0 1-.057.084c-.023.03-.05.057-.105.111"
    />
  </svg>
)
const ForwardRef = forwardRef(Pin02Sm)
export default ForwardRef
