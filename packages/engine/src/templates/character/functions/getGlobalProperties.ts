
export function getGlobalProperties(prefix: string = ''): any[] {
	let keyValues = [];
	let global = window; // window for browser environments
	for (let prop in global) {
		// check the prefix
		if (prop.indexOf(prefix) === 0) {
			keyValues.push(prop /*+ "=" + global[prop]*/);
		}
	}
	return keyValues; // build the string
}
