import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React, { createRef } from 'react'

import FullscreenContainer from './index'
import { Primary as story } from './index.stories'

describe('FullscreenContainer', () => {
  it('- should render', () => {
    const wrapper = shallow(
      <FullscreenContainer {...story?.args} ref={createRef()}>
        <div>hello</div>
      </FullscreenContainer>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
