import express from "express";
import cookieParser from "cookie-parser";
const app = express();
import { router as coursesRouter } from "./routes/courses.mjs";
import {
	checkUserAuthenticated,
	checkUserNotAuthenticated,
	login,
	signup,
	errorCodes,
	getJWT,
} from "./userSys.mjs";
import * as pagesRender from "./pagesRender.mjs";

// 200: OK 201: Created 204: No Content
// 400: Bad req 401: Unauthorized 403: Forbidden 404: Not Found 409: Conflict
// 500: Server err 501: unimplemented

/*
$.post('/courses/answers/id', {answer:'1'},function(data,status){
    alert('Data: ' + JSON.stringify(data)+ '\nStatus: ' + status)
})
*/

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static("./public"));

app.set("view engine", "ejs");

app.get("/", checkUserAuthenticated, async (req, res) => {
	switch (req.query.site) {
		case undefined: {
			return await pagesRender.renderMainPage(req, res);
		}
		case "createCourse": {
			return res.render("createCourse");
		}
		case "intro": {
			return await pagesRender.renderIntroPage(req, res);
		}
		case "chapter": {
			return await pagesRender.renderChapterPage(req, res);
		}
		case "progress": {
			return await pagesRender.renderProgressPage(req, res);
		}
		case "outro": {
			return res.render("outro");
		}
		default:
			return res.redirect("/404");
	}
});

app.get("/404", (req, res) => {
	res.status(404).render("404");
});

app.get("/login", checkUserNotAuthenticated, (req, res) => {
	res.render("login", { messages: {} });
});

app.post("/login", async (req, res) => {
	let loginStatus = await login(req.body.email, req.body.password);
	switch (loginStatus.errorCode) {
		case 0:
			res.cookie("jwt", await getJWT(req.body.email));
			return res.redirect("/");
		case errorCodes.incorrectEmail:
			return res.status(401).render("login", {
				messages: {
					errorCode: errorCodes.incorrectEmail,
					error: "Incorrect Email",
				},
			});
		case errorCodes.incorrectPassword:
			return res.status(401).render("login", {
				messages: {
					errorCode: errorCodes.incorrectPassword,
					error: "Incorrect Password",
				},
			});
		case errorCodes.serverError:
			return res.status(500).render("login", {
				messages: {
					errorCode: errorCodes.serverError,
					error: "Internal Error",
				},
			});
		default:
			return res.status(501).render("login", {
				messages: {
					errorCode: errorCodes.serverError,
					error: "Internal Error",
				},
			});
	}
});

app.get("/signup", checkUserNotAuthenticated, (req, res) => {
	res.render("signup", { messages: {} });
});

app.post("/signup", async (req, res) => {
	if (req.body.password.length < 4) {
		return res.status(400).render("signup", {
			messages: {
				errorCode: errorCodes.incorrectPassword,
				error: "Password needs to be at least 4 characters long",
			},
		});
	}
	let signupStatus = await signup(
		req.body.email,
		req.body.username,
		req.body.password
	);
	if (signupStatus.errorCode == errorCodes.emailUsed)
		return res.status(403).render("signup", {
			messages: {
				errorCode: errorCodes.emailUsed,
				error: "Email Already Used",
			},
		});
	return res.redirect("/login");
});

app.use("/courses", coursesRouter);

app.listen(3000, () => {
	console.log("Started server at http://localhost:3000");
});
