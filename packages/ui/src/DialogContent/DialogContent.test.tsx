import { shallow } from 'enzyme'
import React from 'react'

import DialogContent from './index'
import { Default as story } from './index.stories'

describe('DialogContent', () => {
  it('- should render', () => {
    const wrapper = shallow(<DialogContent {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
