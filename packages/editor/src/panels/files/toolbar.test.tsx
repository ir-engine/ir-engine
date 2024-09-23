/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { render, screen } from '@testing-library/react'
import { expect } from 'chai'
import React from 'react'
import FilesToolbar from './toolbar' // Assuming the component is in the same directory

describe('toolbar Component', () => {
  let useCurrentFilesStub

  it('should render the FilesToolbar component with child components that have data-testid attributes', () => {
    render(<FilesToolbar />)

    const backButton = screen.getByTestId('files-panel-back-directory-button')
    expect(backButton).to.exist

    const newDirectoryButton = screen.getByTestId('files-panel-refresh-directory-button')
    expect(newDirectoryButton).to.exist

    const refreshDirectoryButton = screen.getByTestId('files-panel-refresh-directory-button')
    expect(refreshDirectoryButton).to.exist

    const viewOptionsButton = screen.getByTestId('files-panel-view-options-button')
    expect(viewOptionsButton).to.exist

    const viewModeList = screen.getByTestId('files-panel-view-mode-list-button')
    expect(viewModeList).to.exist

    const viewModeIcons = screen.getByTestId('files-panel-view-mode-icons-button')
    expect(viewModeIcons).to.exist

    // TODO: Still need to figure out how to stub the prerequisites here
    // const breadcrumbItem = screen.getByTestId('files-panel-breadcrumb-nested-level-0');
    // expect(breadcrumbItem).to.exist;

    const searchInput = screen.getByTestId('files-panel-search-input')
    expect(searchInput).to.exist

    const downloadButton = screen.getByTestId('files-panel-download-project-button')
    expect(downloadButton).to.exist

    const newFolderButton = screen.getByTestId('files-panel-create-new-folder-button')
    expect(newFolderButton).to.exist

    const uploadFilesButton = screen.getByTestId('files-panel-upload-files-button')
    expect(uploadFilesButton).to.exist

    const uploadFolderButton = screen.getByTestId('files-panel-upload-folder-button')
    expect(uploadFolderButton).to.exist

    // TODO: Still need to see about adding test file content
  })
})
