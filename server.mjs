import express from "express";
const app = express();
import { router as coursesRouter } from "./routes/courses.mjs";
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./public"));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
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

			if (data.chapters == undefined)
				return res.status(404).render("404");

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
			return res.status(404).render("404");
	}
});

app.use("/courses", coursesRouter);

app.listen(3000, () => {
	console.log("Started server at http://localhost:3000");
});
