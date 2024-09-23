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
