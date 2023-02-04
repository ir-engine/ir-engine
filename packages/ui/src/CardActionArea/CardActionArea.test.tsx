import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import CardActionArea from './index'
import { Default as story } from './index.stories'

describe('CardActionArea', () => {
  it('- should render', () => {
    const wrapper = shallow(<CardActionArea {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
