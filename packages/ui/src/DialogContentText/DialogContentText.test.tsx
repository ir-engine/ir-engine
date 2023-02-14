import { shallow } from 'enzyme'
import React from 'react'

import DialogContentText from './index'
import { Default as story } from './index.stories'

describe('DialogContentText', () => {
  it('- should render', () => {
    const wrapper = shallow(<DialogContentText {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
