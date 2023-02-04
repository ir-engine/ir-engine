import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import TableSortLabel from './index'
import { Default as story } from './index.stories'

describe('TableSortLabel', () => {
  it('- should render', () => {
    const wrapper = shallow(<TableSortLabel {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
