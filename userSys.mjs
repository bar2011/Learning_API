import { runSqlCode } from "./routes/courses.mjs";
import { encodeUserData } from "./jwt.mjs";
import bcrypt from "bcrypt";

export const errorCodes = {
	incorrectEmail: 1,
	incorrectPassword: 2,
	emailUsed: 3,
	serverError: 4,
};

export function checkUserAuthenticated(req, res, next) {
	let cookie = req.cookies.jwt;
	if (cookie === undefined) {
		return res.redirect("/login");
	}
	next();
}

export function checkUserNotAuthenticated(req, res, next) {
	let cookie = req.cookies.jwt;
	if (cookie !== undefined) {
		return res.redirect("/");
	}
	next();
}

export async function login(email, password) {
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

export async function signup(email, username, password) {
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

export async function getJWT(email) {
	let username = await runSqlCode(
		"SELECT username FROM user_crad WHERE email = ?",
		[email]
	)[0].username;
	let jwt = encodeUserData(email, username);
	return jwt;
}
