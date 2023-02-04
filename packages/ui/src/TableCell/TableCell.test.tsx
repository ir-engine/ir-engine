import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import TableCell from './index'
import { Default as story } from './index.stories'

describe('TableCell', () => {
  it('- should render', () => {
    const wrapper = shallow(<TableCell {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
