import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import TablePagination from './index'
import { Primary as story } from './index.stories'

describe('TablePagination', () => {
  it('- should render', () => {
    const wrapper = shallow(<TablePagination {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
