import type { UpdateEvents, ViewInput } from "../../common/types";

const updateDepth = async (
	{ abbrev, playoffs, pos, tid }: ViewInput<"depth">,
	updateEvents: UpdateEvents,
	state: any,
) => {
	throw new Error("Not implemented");
};

export default updateDepth;
