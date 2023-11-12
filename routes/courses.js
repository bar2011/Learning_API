const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const util = require("util");
const fs = require("fs");
const mysql = require("mysql2");
const http = require("http");
const axios = require("axios");

const readFile = util.promisify(fs.readFile);

var connection;
connectToMySql();

async function connectToMySql() {
	// read file database.txt and extract database username and password from it
	data = (await readFile("./database.txt", "utf8")).split("\r\n");
	let username = data[0];
	let password = data[1];

	// Connect to database
	connection = mysql.createPool({
		host: "localhost",
		user: username,
		password: password,
		database: "sql_learning_api",
	});
}

// Run MySQL code using a promise rather then a nested callback
function runSqlCode(sql, args = []) {
	return new Promise((resolve, reject) => {
		connection.query(sql, args, (err, result) => {
			if (err) throw err;
			resolve(result);
		});
	});
}

function getRequest(url) {
	return new Promise((resolve, reject) => {
		http.get(`http://localhost:3000${url}`, (resp) => {
			resolve(resp);
		});
	});
}

async function checkImageLink(imageUrl) {
	if (imageUrl.match(/.png$|.jpg$|.jpeg$/) == null) return 400;

	var response;

	try {
		response = await axios.get(imageUrl, {
			responseType: "arraybuffer",
		});
	} catch {
		return 404;
	}
	let error = response.status != 200;

	if (error) return 404;

	return 200;
}

async function getImageFromLink(imageUrl) {
	if ((await checkImageLink(imageUrl)) != 200) return 400;

	const imageName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

	// From https://byby.dev/node-download-image#:~:text=This%20is%20a%20common%20task,that%20data%20to%20a%20file.
	const response = await axios.get(imageUrl, {
		responseType: "arraybuffer",
	});

	fs.writeFile("./public/images/" + imageName, response.data, (err) => {
		if (err) throw err;
	});

	return 201;
}

// 200 (def): OK 201: Created 204: No Content
// 400: Bad req 401: Unauthorized 403: Forbidden 404: Not Found 409: Conflict
// 500: Server err 501: unimplemented

router.post("/options", async (req, res) => {
	// If options with same course and question ID exist than the server can't create another set of options with the same ID
	if (
		(
			await getRequest(
				`/courses/options/${req.body.course_id}?chapterNumber=${req.body.chapterNumber}&questionId=${req.body.question_id}`
			)
		).statusCode == 200
	)
		return res.sendStatus(400);

	// Insert each option into course_options table
	for (let i = 1; i <= req.body.options_list.length; i++) {
		runSqlCode("INSERT INTO course_options VALUES (?, ?, ?, ?)", [
			req.body.course_id,
			req.body.chapterNumber,
			req.body.question_id + i,
			req.body.options_list[i - 1],
		]);
	}
	res.sendStatus(201);
});
router.get("/options/:id", async (req, res) => {
	// Extract course and question id from id given in parameters and query
	let courseId = req.params.id;
	let currentChapter = req.query.currentChapter;
	let questionId = req.query.questionId;

	if (courseId == null || currentChapter == null || questionId == null)
		return res.sendStatus(400);

	// Select options
	let optionsList = await runSqlCode(
		"SELECT * FROM course_options WHERE course_id = ? AND chapter_number = ? AND question_id REGEXP ?",
		[courseId, currentChapter, "^" + questionId]
	);

	if (optionsList.length <= 0) return res.sendStatus(404);

	res.send(optionsList);
});

router.post("/answers", async (req, res) => {
	// If answer hash with same course and question ID exist than the server can't create another answer with the same ID
	if (
		(
			await getRequest(
				`/courses/answers/${req.body.course_id}?currentChapter=${req.body.chapterNumber}&questionId=${req.body.question_id}`
			)
		).statusCode == 200
	)
		return res.sendStatus(400);

	try {
		// Hash answer gave by client
		const hashedAnswer = await bcrypt.hash("" + req.body.answer, 10);
		runSqlCode("INSERT INTO course_answers VALUES (?, ?, ?, ?)", [
			req.body.course_id,
			req.body.chapterNumber,
			req.body.question_id,
			hashedAnswer,
		]);
		res.sendStatus(201);
	} catch {
		res.sendStatus(500);
	}
});

router.get("/answers/:id", async (req, res) => {
	// Extract course and question id from id given in parameters and in query
	let courseId = req.params.id;
	let currentChapter = req.query.currentChapter;
	let questionId = req.query.questionId;

	if (courseId == null || currentChapter == null || questionId == null)
		return res.sendStatus(400);

	// Select answer hash
	let answerHash = await runSqlCode(
		"SELECT * FROM course_answers WHERE course_id = ? AND chapter_number = ? AND question_id REGEXP ?",
		[courseId, currentChapter, "^" + questionId]
	);

	if (answerHash.length <= 0) return res.sendStatus(404);

	res.send(answerHash);
});

router.post("/answers/:id", async (req, res) => {
	// Extract course and question id from id given in parameters and in query
	let courseId = req.params.id;
	let currentChapter = req.query.currentChapter;
	let questionId = req.query.questionId;

	if (courseId == null || currentChapter == null || questionId == null)
		return res.sendStatus(400);

	// Select answer hash
	let answerHash = await runSqlCode(
		"SELECT * FROM course_answers WHERE course_id = ? AND chapter_number = ? AND question_id REGEXP ?",
		[courseId, currentChapter, "^" + questionId]
	);

	if (answerHash.length <= 0) return res.status(404).send(false);

	try {
		// Compare answer client gave with answer hash stored in database
		if (
			await bcrypt.compare(
				"" + req.body.option,
				answerHash[0].answer_hash
			)
		) {
			res.send(true);
		} else {
			res.send(false);
		}
	} catch {
		res.sendStatus(500);
	}
});

router.post("/image", async (req, res) => {
	return res.sendStatus(await checkImageLink(req.body.url));
});

router.get("/id", async (req, res) => {
	const courses = await runSqlCode("SELECT course_id FROM courses");
	if (courses.length <= 0) return res.send(1 + "");
	res.send(courses.length + 1 + "");
});

router
	.route("/:id")
	.get(async (req, res) => {
		let course = await runSqlCode(
			"SELECT * FROM courses WHERE course_id = ?",
			[req.params.id]
		);
		if (course.length <= 0) return res.sendStatus(404);
		res.send(course[0]);
	})
	.put(async (req, res) => {
		// Check if course with that ID exist by trying to send a get request and checking the statusCode of result
		if ((await getRequest(`/courses/${req.params.id}`)).statusCode == 404)
			return res.sendStatus(404);

		// Update course with values
		runSqlCode(
			"UPDATE courses SET current_chapter = ? WHERE course_id = ?",
			[req.body.currentChapter, req.params.id]
		);
		runSqlCode(
			"UPDATE course_chapters SET current_section = ? WHERE course_id = ? AND chapter_number = ?",
			[req.body.currentSection, req.params.id, req.body.currentChapter]
		);
		res.sendStatus(204);
	})
	.delete(async (req, res) => {
		// Check if course with that ID exist by trying to send a get request and checking the statusCode of result
		if ((await getRequest(`/courses/${req.params.id}`)).statusCode == 404)
			return res.sendStatus(404);

		// Delete course from main courses table
		runSqlCode("DELETE FROM courses WHERE course_id = ?", [req.params.id]);
		// Delete course from other tables
		runSqlCode("DELETE FROM course_chapters WHERE course_id = ?", [
			req.params.id,
		]);
		runSqlCode("DELETE FROM course_answers WHERE course_id = ?", [
			req.params.id,
		]);
		runSqlCode("DELETE FROM course_options WHERE course_id = ?", [
			req.params.id,
		]);

		res.sendStatus(204);
	});

router.post("/", async (req, res) => {
	// If course with same ID exist than the server can't create another course with the same ID
	if ((await getRequest(`/courses/${req.body.id}`)).statusCode == 200)
		return res.sendStatus(400);

	req.body.chapters.forEach((chapter) => {
		runSqlCode(
			`INSERT INTO course_chapters (course_id, chapter_number, chapter_title, chapter_image, chapter_html) VALUES (?, ?, ?, ?, ?)`,
			[
				req.body.courseId,
				chapter.chapterNumber,
				chapter.title,
				chapter.image,
				chapter.html,
			]
		);
	});

	// Insert a new course into courses table
	runSqlCode(
		`INSERT INTO courses (course_title, course_description, course_image) VALUES (?, ?, ?)`,
		[req.body.title, req.body.description, req.body.image]
	);
	res.sendStatus(201);
});

module.exports = {
	router,
	runSqlCode,
	getImageFromLink,
};
