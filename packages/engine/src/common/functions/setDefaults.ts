import * as _ from 'lodash';
//#endregion
//#region Miscellaneous

export function setDefaults(options: {}, defaults: {}): {} {
	return _.defaults({}, _.clone(options), defaults);
}
