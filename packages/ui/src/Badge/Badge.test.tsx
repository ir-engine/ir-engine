import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Badge from './index'
import { Default as story } from './index.stories'

describe('Badge', () => {
  it('- should render', () => {
    const wrapper = shallow(<Badge {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
