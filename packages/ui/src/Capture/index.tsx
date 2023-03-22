import { ArrowPathIcon, FilmIcon, PlayIcon, StopIcon, TrashIcon } from '@heroicons/react/24/solid'
import React, { useCallback, useState } from 'react'

/**
 * Props for Dashboard component
 */
interface DashboardProps {
  children: React.ReactNode
}

/**
 * Dashboard component
 */
function CaptureDashboard({ children }: DashboardProps) {
  const onPlay = () => {}
  const onStop = () => {}
  const onLoop = () => {}

  return (
    <>
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Capture Pose</a>
        </div>
        <div className="flex-none">
          <label htmlFor="my-drawer" className="btn drawer-button btn-square btn-ghost">
            <FilmIcon className="h-5 w-5 text-gray-100" />
          </label>
        </div>
      </div>
      <div className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <div className="flex flex-col h-screen">
            <div className="flex-grow bg-gray-800">
              <div className="relative grid grid-cols-1 gap-0">
                <div className="flex items-center justify-center">{children}</div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-4 btn-group">
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-300 focus:outline-none"
                      onClick={onPlay}
                    >
                      <PlayIcon className="h-5 w-5 text-gray-100" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-300 focus:outline-none"
                      onClick={onStop}
                    >
                      <StopIcon className="h-5 w-5 text-gray-100" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-300 focus:outline-none"
                      onClick={onLoop}
                    >
                      <ArrowPathIcon className="h-5 w-5 text-gray-100" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 bg-base-100">
            <li>
              <a className="active">
                <span className="label-text">Recording 1</span>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-300 focus:outline-none"
                  onClick={onLoop}
                >
                  <TrashIcon className="h-5 w-5 text-gray-100" />
                </button>
              </a>
            </li>
            <li>
              <a>
                <span className="label-text">Recording 2</span>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-300 focus:outline-none"
                  onClick={onLoop}
                >
                  <TrashIcon className="h-5 w-5 text-gray-100" />
                </button>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

CaptureDashboard.defaultProps = {
  children: <div className="aspect-video min-w-full min-h-full bg-black"></div>
}

export default CaptureDashboard
