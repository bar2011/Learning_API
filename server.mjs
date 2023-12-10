import express from "express";
import cookieParser from "cookie-parser";
const app = express();
import { router as coursesRouter } from "./routes/courses.mjs";
import { UserSystem } from "./userSys.mjs";
import { RenderPage } from "./pagesRender.mjs";

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

app.get("/", UserSystem.checkUserAuthenticated, async (req, res) => {
	switch (req.query.site) {
		case undefined: {
			return await RenderPage.renderMainPage(req, res);
		}
		case "createCourse": {
			return res.render("createCourse");
		}
		case "intro": {
			return await RenderPage.renderIntroPage(req, res);
		}
		case "chapter": {
			return await RenderPage.renderChapterPage(req, res);
		}
		case "progress": {
			return await RenderPage.renderProgressPage(req, res);
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

app.get("/login", UserSystem.checkUserNotAuthenticated, (req, res) => {
	res.render("login", { messages: {} });
});

app.post("/login", async (req, res) => {
	let loginStatus = await UserSystem.login(req.body.email, req.body.password);
	switch (loginStatus.errorCode) {
		case 0:
			res.cookie("jwt", await UserSystem.getJWT(req.body.email));
			return res.redirect("/");
		case UserSystem.errorCodes.incorrectEmail:
			return res.status(401).render("login", {
				messages: {
					errorCode: UserSystem.errorCodes.incorrectEmail,
					error: "Incorrect Email",
				},
			});
		case UserSystem.errorCodes.incorrectPassword:
			return res.status(401).render("login", {
				messages: {
					errorCode: UserSystem.errorCodes.incorrectPassword,
					error: "Incorrect Password",
				},
			});
		case UserSystem.errorCodes.serverError:
			return res.status(500).render("login", {
				messages: {
					errorCode: UserSystem.errorCodes.serverError,
					error: "Internal Error",
				},
			});
		default:
			return res.status(501).render("login", {
				messages: {
					errorCode: UserSystem.errorCodes.serverError,
					error: "Internal Error",
				},
			});
	}
});

app.get("/signup", UserSystem.checkUserNotAuthenticated, (req, res) => {
	res.render("signup", { messages: {} });
});

app.post("/signup", async (req, res) => {
	if (req.body.password.length < 4) {
		return res.status(400).render("signup", {
			messages: {
				errorCode: UserSystem.errorCodes.incorrectPassword,
				error: "Password needs to be at least 4 characters long",
			},
		});
	}
	let signupStatus = await UserSystem.signup(
		req.body.email,
		req.body.username,
		req.body.password
	);
	if (signupStatus.errorCode == UserSystem.errorCodes.emailUsed)
		return res.status(403).render("signup", {
			messages: {
				errorCode: UserSystem.errorCodes.emailUsed,
				error: "Email Already Used",
			},
		});
	return res.redirect("/login");
});

app.use("/courses", coursesRouter);

app.listen(3000, process.env.PORT, () => {
	console.log(`Started server at http://${process.env.PORT}:3000`);
});
