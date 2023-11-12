const runSqlCode = require("./routes/courses").runSqlCode;
const getImageFromLink = require("./routes/courses").getImageFromLink;

async function getMainPageData() {
	let imageLinks = await runSqlCode("SELECT course_image FROM courses");
	imageLinks.forEach((link) => {
		getImageFromLink(link.course_image);
	});
	let courses = await runSqlCode("SELECT * FROM courses");
	return { courses };
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

module.exports = {
	getMainPageData,
	getIntroData,
	getChapterData,
	getProgressData,
};
