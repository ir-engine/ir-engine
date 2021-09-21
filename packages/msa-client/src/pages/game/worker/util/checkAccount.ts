import { ACCOUNT_API_URL, fetchWrapper } from "../../common";
import local from "./local";
import toUI from "./toUI";
import type { PartialTopMenu } from "../../common/types";

const checkAccount = async (): Promise<PartialTopMenu> => {
	try {
		const data = await fetchWrapper({
			url: `${ACCOUNT_API_URL}/user_info.php`,
			method: "GET",
			data: {
				sport: "basketball",
			},
			credentials: "include",
		});

		// Keep track of latest here, for ads and multi tab sync
		local.goldUntil = data.gold_until;
		local.mailingList = !!data.mailing_list;
		local.username = data.username === "" ? undefined : data.username;
		const currentTimestamp = Math.floor(Date.now() / 1000);
		await toUI("updateLocal", [
			{
				gold: currentTimestamp <= data.gold_until,
				username: data.username,
			},
		]);

		return {
			email: data.email,
			goldCancelled: !!data.gold_cancelled,
			goldUntil: data.gold_until,
			username: data.username,
			mailingList: !!data.mailing_list,
		};
	} catch (err) {
		// Don't freak out if an AJAX request fails or whatever
		console.log(err);
		return {
			email: "",
			goldCancelled: false,
			goldUntil: Infinity,
			username: "",
			mailingList: false,
		};
	}
};

export default checkAccount;
