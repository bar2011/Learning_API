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
} from "./userSys.mjs";
import {
	getMainPageData,
	getIntroData,
	getChapterData,
	getProgressData,
} from "./pagesData.mjs";

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
			let data = await getMainPageData();
			return res.render("main", { courses: data.courses });
		}
		case "createCourse": {
			return res.render("createCourse");
		}
		case "intro": {
			let data = await getIntroData(req);
			return res.render("intro", { title: data.title, id: data.id });
		}
		case "chapter": {
			let data = await getChapterData(req);
			if (data.chapterData == undefined)
				return res.status(404).render("404");
			return res.render("chapter", {
				chapterHtml: data.chapterData[0].chapter_html,
				title: data.chapterData[0].chapter_title,
				id: req.query.id,
				chapterProgress: data.chapterData[0].current_section,
				currentChapter: data.courseData[0].current_chapter,
			});
		}
		case "progress": {
			let data = await getProgressData(req);

			if (data.chapters == undefined) return res.redirect("/404");

			return res.render("progress", {
				courseTitle: data.courseData[0].course_title,
				currentChapter: data.courseData[0].current_chapter,
				chapters: data.chapters,
				id: req.query.id,
			});
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
			res.cookie("email", req.body.email);
			return res.redirect("/");
		case errorCodes.incorrectEmail:
			return res
				.status(401)
				.render("login", { messages: { error: "Incorrect Email" } });
		case errorCodes.incorrectPassword:
			return res
				.status(401)
				.render("login", { messages: { error: "Incorrect Password" } });
		case errorCodes.serverError:
			return res
				.status(500)
				.render("login", { messages: { error: "Internal Error" } });
	}
	return res.status(501).send("How.");
});

app.get("/signup", checkUserNotAuthenticated, (req, res) => {
	res.render("signup", { messages: {} });
});

app.post("/signup", async (req, res) => {
	let signupStatus = await signup(
		req.body.email,
		req.body.name,
		req.body.password
	);
	if (signupStatus.errorCode == errorCodes.emailUsed)
		return res
			.status(403)
			.render("signup", { messages: { error: "Email Already Used" } });
	return res.redirect("/login");
});

app.use("/courses", coursesRouter);

app.listen(3000, () => {
	console.log("Started server at http://localhost:3000");
});
