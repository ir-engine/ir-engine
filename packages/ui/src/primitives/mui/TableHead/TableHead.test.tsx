import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import TableHead from './index'
import { Default as story } from './index.stories'

describe('TableHead', () => {
  it('- should render', () => {
    const wrapper = shallow(<TableHead {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
