import { getUserDataFromJWT } from "./jwt.mjs";
import { runSqlCode, getImageFromLink } from "./routes/courses.mjs";

async function getMainPageData() {
	let imageLinks = await runSqlCode("SELECT course_image FROM courses");
	imageLinks.forEach((link) => {
		getImageFromLink(link.course_image);
	});
	let courses = await runSqlCode("SELECT * FROM courses");
	return courses;
}

export async function renderMainPage(req, res) {
	let courses = await getMainPageData();
	return res.render("main", { courses });
}

async function getIntroData(req) {
	if (parseInt(req.query.id) == undefined) return {};
	let title = await runSqlCode(
		"SELECT course_title FROM courses WHERE course_id = ?",
		[req.query.id]
	);
	if (title.length <= 0) return {};
	title = title[0].course_title;

	// Check if user already entered course
	// If not, create a new row for the specific user for the specific course
	const email = getUserDataFromJWT(req.cookies.jwt).payload.sub;
	const courseData = await runSqlCode(
		"SELECT current_chapter, current_section FROM user_progress WHERE user_email = ? AND course_id = ?",
		[email, req.query.id]
	);
	if (courseData.length <= 0) {
		await runSqlCode(
			"INSERT user_progress VALUE (?, ?, DEFAULT, DEFAULT)",
			[email, req.query.id]
		);
	}

	return { title, id: req.query.id };
}

export async function renderIntroPage(req, res) {
	let data = await getIntroData(req);
	return res.render("intro", { title: data.title, id: data.id });
}

async function getChapterData(req) {
	if (parseInt(req.query.chapterNumber) == undefined) return {};
	if (parseInt(req.query.id) == undefined) return {};

	const email = getUserDataFromJWT(req.cookies.jwt).payload.sub;
	const userData = await runSqlCode(
		"SELECT current_chapter, current_section FROM user_progress WHERE user_email = ? AND course_id = ?",
		[email, req.query.id]
	);

	if (userData.length <= 0) return {};

	const chapterData = await runSqlCode(
		"SELECT chapter_html, chapter_title FROM course_chapters WHERE course_id = ? AND chapter_number = ?",
		[req.query.id, req.query.chapterNumber]
	);

	if (chapterData.length <= 0) return {};

	return { chapterData, userData };
}

export async function renderChapterPage(req, res) {
	let data = await getChapterData(req);
	if (data.chapterData == undefined) return res.status(404).render("404");
	return res.render("chapter", {
		chapterHtml: data.chapterData[0].chapter_html,
		title: data.chapterData[0].chapter_title,
		id: req.query.id,
		chapterNumber: req.query.chapterNumber,
		currentSection: data.userData[0].current_section,
		currentChapter: data.userData[0].current_chapter,
	});
}

async function getProgressData(req) {
	const email = getUserDataFromJWT(req.cookies.jwt).payload.sub;
	const userData = await runSqlCode(
		"SELECT current_chapter FROM user_progress WHERE course_id = ? AND user_email = ?",
		[req.query.id, email]
	);

	const courseData = await runSqlCode(
		"SELECT course_title FROM courses WHERE course_id = ?",
		[req.query.id]
	);
	const chapters = await runSqlCode(
		"SELECT chapter_title, chapter_image FROM course_chapters WHERE course_id = ?",
		[req.query.id]
	);
	if (userData.length <= 0 || courseData.length <= 0 || chapters.length <= 0)
		return {};

	return { courseData, chapters, userData };
}

export async function renderProgressPage(req, res) {
	let data = await getProgressData(req);

	if (data.chapters == undefined) return res.redirect("/404");

	return res.render("progress", {
		courseTitle: data.courseData[0].course_title,
		currentChapter: data.userData[0].current_chapter,
		chapters: data.chapters,
		id: req.query.id,
	});
}
