import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import mysql2 from "mysql2";
import http from "http";
import axios from "axios";
import { Jwt } from "../utils/jwt.mjs";

export const router = express.Router();

var connection;
connectToMySql();

async function connectToMySql() {
	// Connect to database
	connection = mysql2.createPool({
		host: "localhost",
		user: process.env.USER,
		password: process.env.PASSWORD,
		database: "sql_database",
	});

	console.log("Connected to MySQL database");
}

// Run MySQL code using a promise rather then a nested callback
export function runSqlCode(sql, args = []) {
	return new Promise((resolve, reject) => {
		connection.query(sql, args, (err, result) => {
			if (err) throw err;
			resolve(result);
		});
	});
}

function getRequest(url) {
	return new Promise((resolve, reject) => {
		http.get(`http://${process.env.URL}:3000${url}`, (resp) => {
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

export async function getImageFromLink(imageUrl) {
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
		(await getRequest(
			`/courses/options/${req.body.course_id}?chapterNumber=${req.body.chapterNumber}&questionId=${req.body.question_id}`
		).statusCode) == 200
	)
		return res.sendStatus(400);

	// Insert each option into course_options table
	for (let i = 1; i <= req.body["optionsList[]"].length; i++) {
		runSqlCode("INSERT INTO course_options VALUES (?, ?, ?, ?)", [
			req.body.course_id,
			req.body.chapterNumber,
			req.body.question_id + i,
			req.body["optionsList[]"][i - 1],
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

		const email = Jwt.getUserDataFromJWT(req.cookies.jwt).payload.sub;
		await runSqlCode(
			"UPDATE user_progress SET current_chapter = ?, current_section = ? WHERE user_email = ? AND course_id = ?",
			[
				req.body.currentChapter,
				req.body.currentSection,
				email,
				req.params.id,
			]
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

	JSON.parse(req.body.chapters).forEach((chapter) => {
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
