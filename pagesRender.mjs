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
	return { title, id: req.query.id };
}

export async function renderIntroPage(req, res) {
	let data = await getIntroData(req);
	return res.render("intro", { title: data.title, id: data.id });
}

async function getChapterData(req) {
	if (parseInt(req.query.chapterNumber) == undefined) return {};
	if (parseInt(req.query.id) == undefined) return {};
	let chapterData = await runSqlCode(
		"SELECT chapter_html, chapter_title, current_section FROM course_chapters WHERE course_id = ? AND chapter_number = ?",
		[req.query.id, req.query.chapterNumber]
	);
	let courseData = await runSqlCode(
		"SELECT current_chapter FROM courses WHERE course_id = ?",
		[req.query.id]
	);

	if (courseData.length < 1 || chapterData.length < 1) return {};

	return { chapterData, courseData };
}

export async function renderChapterPage(req, res) {
	let data = await getChapterData(req);
	if (data.chapterData == undefined) return res.status(404).render("404");
	return res.render("chapter", {
		chapterHtml: data.chapterData[0].chapter_html,
		title: data.chapterData[0].chapter_title,
		id: req.query.id,
		currentSection: data.chapterData[0].current_section,
		currentChapter: data.courseData[0].current_chapter,
	});
}

async function getProgressData(req) {
	let courseData = await runSqlCode(
		"SELECT course_title, current_chapter FROM courses WHERE course_id = ?",
		[req.query.id]
	);
	const chapters = await runSqlCode(
		"SELECT chapter_title, chapter_image FROM course_chapters WHERE course_id = ?",
		[req.query.id]
	);
	if (courseData.length <= 0 || chapters.length <= 0) return {};

	return { courseData, chapters };
}

export async function renderProgressPage(req, res) {
	let data = await getProgressData(req);

	if (data.chapters == undefined) return res.redirect("/404");

	return res.render("progress", {
		courseTitle: data.courseData[0].course_title,
		currentChapter: data.courseData[0].current_chapter,
		chapters: data.chapters,
		id: req.query.id,
	});
}
