import { runSqlCode } from "./routes/courses.mjs";
import bcrypt from "bcrypt";

export const errorCodes = {
	incorrectEmail: 1,
	incorrectPassword: 2,
	emailUsed: 3,
	serverError: 4,
};

export function checkUserAuthentication(req, res, next) {
	let cookie = req.cookies.email;
	if (cookie === undefined) {
		res.redirect("/login");
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
	runSqlCode("INSERT user_crad VALUES (?, ?, ?)", [
		email,
		username,
		hashedPassword,
	]);

	return { errorCode: 0 };
}
