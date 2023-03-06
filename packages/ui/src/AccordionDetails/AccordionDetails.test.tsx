import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import AccordianDetails from './index'
import { Default as story } from './index.stories'

describe('AccordianDetails', () => {
  it('- should render', () => {
    const wrapper = shallow(<AccordianDetails {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
