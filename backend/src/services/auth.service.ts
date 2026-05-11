import { RegisterInput, LoginInput, RefreshTokenInput } from "../validators/auth.validator";
import bcrypt from "bcrypt";
import UserRepository from "../repositories/user.repository";
import RefreshTokenService from "./refresh-token.service";

type PublicUser = {
	id: string;
	name: string;
	email: string;
	role: "ADMIN" | "STAFF";
	acceptedPolicy: boolean;
	policyAcceptedAt: Date | null;
	policyVersion: string | null;
	anonymizedAt: Date | null;
	anonymizedReason: string | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

type RegisterContext = {
	policyAcceptedIp?: string | null;
	policyAcceptedUserAgent?: string | null;
}

export class AuthService {
	/**
	 * Register a new user created by an ADMIN
	 */
	public static async register(input: RegisterInput, context: RegisterContext = {}): Promise<PublicUser> {
		const { name, email, password, role, acceptedPolicy } = input;


		// Check existing email
		const existing = await UserRepository.findByEmail(email);
		if (existing) {
			throw new Error("EMAIL_ALREADY_EXISTS");
		}

		// Hash password (cost factor >= 10)
		const envRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
		const saltRounds = Math.max(envRounds, 10);
		const hashed = await bcrypt.hash(password, saltRounds);

		// Save policy metadata
		const policyAcceptedAt = new Date();
		const policyVersion = process.env.POLICY_VERSION ?? "1";

		// create user and policy acceptance using repository
		const created = await UserRepository.createUserAndSavePolicyAcceptance({
			name,
			email,
			passwordHash: hashed,
			role,
			acceptedPolicy,
			policyAcceptedAt,
			policyVersion,
			policyAcceptedIp: context.policyAcceptedIp ?? null,
			userAgent: context.policyAcceptedUserAgent ?? null,
		});

		const user = created;

		console.warn(
			JSON.stringify({
				event: "policy_accepted",
				userId: user.id,
				policyVersion,
				acceptedAt: policyAcceptedAt.toISOString(),
			}),
		);

		return user;
	}

	/**
	 * Login user and return tokens
	 */
	public static async login(input: LoginInput): Promise<{ accessToken: string; refreshToken: string }> {
		const { email, password } = input;

		const user = await UserRepository.findByEmail(email);

		// Do not reveal whether email exists
		if (!user) {
			throw new Error("INVALID_CREDENTIALS");
		}

		if (!user.isActive) {
			throw new Error("USER_INACTIVE");
		}

		const match = await bcrypt.compare(password, user.passwordHash as string);
		if (!match) {
			throw new Error("INVALID_CREDENTIALS");
		}

		return RefreshTokenService.issueTokens({
			id: user.id,
			role: user.role as "ADMIN" | "STAFF",
		});
	}

	/**
	 * Refresh access token using a valid refresh token
	 */
	public static async refreshToken(input: RefreshTokenInput): Promise<{ accessToken: string }> {
		const { refreshToken } = input;
		if (!refreshToken) {
			throw new Error("INVALID_TOKEN");
		}

		const tokens = await RefreshTokenService.refresh(refreshToken);
		return { accessToken: tokens.accessToken };
	}
}

export default AuthService;
