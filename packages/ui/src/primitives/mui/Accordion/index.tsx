import React, { ReactNode } from 'react'

import AccordionDetails from '@etherealengine/ui/src/primitives/mui/AccordionDetails'
import AccordionSummary from '@etherealengine/ui/src/primitives/mui/AccordionSummary'

import { AccordionProps, Accordion as MuiAccordion } from '@mui/material'

const Accordion = (props: AccordionProps) => <MuiAccordion {...props} />

Accordion.displayName = 'Accordion'

Accordion.defaultProps = {
  open: false,
  children: [<AccordionSummary key="1" />, <AccordionDetails key="2" />]
}

export default Accordion
