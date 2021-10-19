import type { DBSchema, IDBPDatabase } from "idb";
import type {
	League,
	Options,
	RealPlayerPhotos,
	RealTeamInfo,
} from "../../common/types";
import connectIndexedDB from "./connectIndexedDB";

export interface MetaDB extends DBSchema {
	attributes: {
		value: number | string | Options | RealPlayerPhotos | RealTeamInfo;
		key:
			| "lastChangesVersion"
			| "nagged"
			| "naggedMailingList"
			| "options"
			| "realPlayerPhotos"
			| "realTeamInfo";
	};
	leagues: {
		value: League;
		key: number;
		autoIncrementKeyPath: "lid";
	};
}

const create = (db: IDBPDatabase<MetaDB>) => {
	const attributeStore = db.createObjectStore("attributes");
	db.createObjectStore("leagues", {
		keyPath: "lid",
		autoIncrement: true,
	});
	attributeStore.put(0, "nagged");
	attributeStore.put("REV_GOES_HERE", "lastChangesVersion");
};

const migrate = ({
	db,
	oldVersion,
}: {
	db: IDBPDatabase<MetaDB>;
	oldVersion: number;
}) => {
	console.log(
		`Upgrading meta database from version ${oldVersion} to version ${db.version}`,
	);

	if (oldVersion <= 7) {
		const attributeStore = db.createObjectStore("attributes");
		attributeStore.put(0, "nagged");
	}

	// New ones here!

	// In next version, can do:
	// attributeStore.delete("lastSelectedTid");
};

const connectMeta = () =>
	connectIndexedDB<MetaDB>({
		name: "meta",
		version: 8,
		lid: -1,
		create,
		migrate,
	});

export default connectMeta;
