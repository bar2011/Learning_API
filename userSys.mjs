import { runSqlCode } from "./routes/courses.mjs";
import { Jwt } from "./jwt.mjs";
import { config } from "dotenv";
config();
import bcrypt from "bcrypt";

export class UserSystem {
	static errorCodes = {
		incorrectEmail: 1,
		incorrectPassword: 2,
		emailUsed: 3,
		serverError: 4,
	};

	static async checkUserAuthenticated(req, res, next) {
		const jsonWebToken = req.cookies.jwt;
		if (jsonWebToken === undefined) return res.redirect("/login");
	
		// Redirect even if cannot parse JSON
		try {
			if (!Jwt.verify(jsonWebToken, process.env.JWT_SECRET)) {
				res.clearCookie("jwt");
				return res.redirect("/login");
			}
		} catch (error) {
			res.clearCookie("jwt");
			return res.redirect("/login");
		}
	
		// Check if user exists
		const email = Jwt.getUserDataFromJWT(jsonWebToken).payload.sub;
		const username = await runSqlCode(
			"SELECT username FROM user_crad WHERE email = ?",
			[email]
		);
		if (username == null || username <= 0) {
			res.clearCookie("jwt");
			return res.redirect("/login");
		}
	
		next();
	}

	static checkUserNotAuthenticated(req, res, next) {
		let cookie = req.cookies.jwt;
		if (cookie !== undefined) {
			return res.redirect("/");
		}
		next();
	}

	static async login(email, password) {
		let userData = await runSqlCode(
			"SELECT email, password_hash FROM user_crad WHERE email = ?",
			[email]
		);
		if (userData.length < 1) return { errorCode: errorCodes.incorrectEmail };
		try {
			if (bcrypt.compareSync(password, userData[0].password_hash))
				return { errorCode: 0 };
			else return { errorCode: errorCodes.incorrectPassword };
		} catch {
			return { errorCode: errorCodes.serverError };
		}
	}
	
	static async signup(email, username, password) {
		let checkEmail = await runSqlCode(
			"SELECT email FROM user_crad WHERE email = ?",
			[email]
		);
	
		if (checkEmail.length > 0) return { errorCode: errorCodes.emailUsed };
	
		let hashedPassword = await bcrypt.hash(password, 10);
		await runSqlCode("INSERT user_crad VALUES (?, ?, ?)", [
			email,
			username,
			hashedPassword,
		]);
	
		return { errorCode: 0 };
	}
	
	static async getJWT(email) {
		let username = await runSqlCode(
			"SELECT username FROM user_crad WHERE email = ?",
			[email]
		);
		if (username.length <= 0) return "-1.-1.-1";
		username = username[0].username;
		let jwt = Jwt.encodeUserData(email, username, process.env.JWT_SECRET);
		return jwt;
	}
}