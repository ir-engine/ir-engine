/**
 * @author robp94 / https://github.com/robp94
 */

import { TaskQueue } from 'yuka';
import { PathPlannerTask } from './PathPlannerTask';

class PathPlanner {

	constructor( navMesh ) {

		this.navMesh = navMesh;

		this.taskQueue = new TaskQueue();

	}

	findPath( vehicle, from, to, callback ) {

		const task = new PathPlannerTask( this, vehicle, from, to, callback );

		this.taskQueue.enqueue( task );

	}

	update() {

		this.taskQueue.update();

	}

}

export { PathPlanner };
