import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Checkbox from './index'
import { Default as story } from './index.stories'

describe('Checkbox', () => {
  it('- should render', () => {
    const wrapper = shallow(<Checkbox {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
