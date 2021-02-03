
export function getGlobalProperties(prefix = ''): any[] {
	const keyValues = [];
	const global = window; // window for browser environments
	for (const prop in global) {
		// check the prefix
		if (prop.indexOf(prefix) === 0) {
			keyValues.push(prop /*+ "=" + global[prop]*/);
		}
	}
	return keyValues; // build the string
}
