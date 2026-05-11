import type { Role } from "../utils/jwt";

declare global {
	namespace Express {
		interface Request {
			user?: {
				sub: string;
				role: Role;
			};
		}
	}
}
