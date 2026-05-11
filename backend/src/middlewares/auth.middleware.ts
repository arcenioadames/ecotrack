import { RequestHandler } from "express";
import { verifyAccessToken, type Role } from "../utils/jwt";

export const authenticate: RequestHandler = (req, res, next) => {
	const auth = req.header("authorization") || req.header("Authorization");
	if (!auth) {
		return res.status(401).json({ message: "Missing authorization header" });
	}

	const parts = auth.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return res.status(401).json({ message: "Invalid authorization format" });
	}

	const token = parts[1];

	try {
		const payload = verifyAccessToken(token);
		req.user = { sub: payload.sub, role: payload.role };
		return next();
	} catch {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};

export const authorize = (...roles: Role[]): RequestHandler => {
	return (req, res, next) => {
		const user = req.user;
		if (!user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (!roles.includes(user.role)) {
			return res.status(403).json({ message: "Forbidden" });
		}

		return next();
	};
};

export default { authenticate, authorize };
