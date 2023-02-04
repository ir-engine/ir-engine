import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Select from './index'
import { Default as story } from './index.stories'

describe('Select', () => {
  it('- should render', () => {
    const wrapper = shallow(<Select {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
