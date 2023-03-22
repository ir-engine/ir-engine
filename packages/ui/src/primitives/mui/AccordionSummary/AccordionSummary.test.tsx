import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import AccordianSummary from './index'
import { Default as story } from './index.stories'

describe('AccordianSummary', () => {
  it('- should render', () => {
    const wrapper = shallow(<AccordianSummary {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
