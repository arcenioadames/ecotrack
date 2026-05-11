import { RegisterInput, LoginInput, RefreshTokenInput } from "../validators/auth.validator";
import { prisma } from "../../prisma/client";
import bcrypt from "bcrypt";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../utils/jwt";

type PublicUser = {
	id: string
	name: string
	email: string
	role: "ADMIN" | "STAFF"
}

export class AuthService {
	/**
	 * Register a new user
	 */
	public static async register(input: RegisterInput): Promise<PublicUser> {
		const { name, email, password, acceptedPolicy } = input;
		const role = "STAFF" as const;

		// Check existing email
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			throw new Error("EMAIL_ALREADY_EXISTS");
		}

		// Hash password (cost factor >= 10)
		const envRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
		const saltRounds = envRounds >= 10 ? envRounds : 10;
		const hashed = await bcrypt.hash(password, saltRounds);

		// Save policy metadata
		const policyAcceptedAt = new Date();
		const policyVersion = process.env.POLICY_VERSION ?? "1";

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashed,
				role,
				acceptedPolicy,
				policyAcceptedAt,
				policyVersion,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
			},
		});

		return user;
	}

	/**
	 * Login user and return tokens
	 */
	public static async login(input: LoginInput): Promise<{ accessToken: string; refreshToken: string }> {
		const { email, password } = input;

		const user = await prisma.user.findUnique({ where: { email } });

		// Do not reveal whether email exists
		if (!user) {
			throw new Error("INVALID_CREDENTIALS");
		}

		if (!user.isActive) {
			throw new Error("USER_INACTIVE");
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			throw new Error("INVALID_CREDENTIALS");
		}

		const payload = { sub: user.id, role: user.role };

		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		return { accessToken, refreshToken };
	}

	/**
	 * Refresh access token using a valid refresh token
	 */
	public static async refreshToken(input: RefreshTokenInput): Promise<{ accessToken: string }> {
		const { refreshToken } = input;

		const payload = verifyRefreshToken(refreshToken);

		// generate new access token
		const accessToken = generateAccessToken({ sub: payload.sub, role: payload.role });

		return { accessToken };
	}
}

export default AuthService;
