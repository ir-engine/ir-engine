import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Collapse from './index'
import { Default as story } from './index.stories'

describe('Collapse', () => {
  it('- should render', () => {
    const wrapper = shallow(<Collapse {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
