import { AppError } from "../../../shared/errors/app-error";
import { handleRoute } from "../../../shared/http/route-handler";

export async function POST() {
	return handleRoute(async () => {
		throw new AppError("Multiplayer stats are not implemented yet", 501, "MULTI_STATS_NOT_IMPLEMENTED");
	});
}
