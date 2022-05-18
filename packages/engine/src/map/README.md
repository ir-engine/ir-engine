
# Map Module

## Synopsis

This module virtually does the reverse of what a cartographer does, transforming a minimal representation of a geography into an fully simulated virtual environment.

## Design Overview

### The _Phase_ Pattern

The real-time transformation of cartographic data for use in a simulated environment has the following constraints: 
- It can be expensive in terms of both CPU time and idle time awaiting asynchronous tasks
- The results should be made available as soon as possible
- Dropped frames should be avoided as much as possible
- It should be possible to adjust the priority of in response to user actions

Given these constraints, complexity could easily get out of hand. This was the impetus for organizing the code into _phases_, a pattern in which a complex process is broken down in to distinct types of tasks, with a unit of code called a _phase_ responsible for enumerating and controlling the execution of tasks of a particular type, while another unit of code decides which tasks to execute and when. The relationship between phases and tasks is similar to that of classes and class instances. For example, fetching `VectorTile` data from a remote service is a _phase_ while fetching the data for a particular tile is a task within that phase. Tasks are identified by keys, which are composed of the minimum information necessary to execute the task. In the fetching example, the key would be the information needed to construct a URL for the tile being fetched. Tasks of one phases may depend on the data produced by another phase, in which case, the enumerated tasks of the dependant phase will only include the tasks which have the data they need. For example, a phase about converting `VectorTile`s to `GeoJSON` features will only include 1 task for each available tile.

### Control Flow

When the engine finds a [map node](packages/editor/src/nodes/MapNode.ts) while loading the world, it starts the process of transforming cartographic data, cascading results through a series of caches, the last of which is then utilized by the [map update system](/packages/engine/src/map/MapUpdateSystem.ts). A center point, given as a lon/lat pair, combined with a radius, determines what data is fetched and eventually added to the scene, fetching tiles that overlap the circle, extracting features within those tiles that also overlap. When the center point changes the whole process defined by these phases is re-executed. Similarly, when the local avatar moves more than a certain amount, the center point is updated and the process is re-executed. The caching architecture automatically ensures that work from previous executions can be reused as much as possible. This code also makes use of worker threads to offload CPU-bound tasks from the main thread, which in JavaScript is also the UI thread.

