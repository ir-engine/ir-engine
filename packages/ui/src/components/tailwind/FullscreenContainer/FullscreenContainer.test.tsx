import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import FullscreenContainer from './index'
import { Default as story } from './index.stories'

describe('FullscreenContainer', () => {
  it('- should render', () => {
    const wrapper = shallow(<FullscreenContainer {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
