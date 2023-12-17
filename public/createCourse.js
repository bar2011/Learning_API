const textRegexp = new RegExp(/^[^"]+$/);
const stringRegexp = new RegExp(/(?<=[,\s]")([^"])*(?="[,\s])/g);
const stringKeywordRegexp = new RegExp(/"([^"])*"/g);

let inputDiv;
let inputtedText = "";
let id;
let title;
let description;

Prism.languages["course"] = {
	string: stringKeywordRegexp,
	keyword: /([qtopd]|cd){\s|\s}([qtopd]|cd)|\s{c}\s/,
	property: /,\s/,
};

// code taken from https://codepen.io/WebCoder49/pen/dyNyraq

function update(text) {
	inputtedText = text;
	let result_element = document.querySelector("#highlighting-content");
	// Handle final newlines (see article)
	if (text[text.length - 1] == "\n") {
		text += " ";
	}
	// Update code
	result_element.innerHTML = text
		.replace(new RegExp("&", "g"), "&amp;")
		.replace(new RegExp("<", "g"), "&lt;"); /* Global RegExp */
	// Syntax Highlight
	Prism.highlightElement(result_element);
}

function sync_scroll(element) {
	/* Scroll result to scroll coords of event - sync with textarea */
	let result_element = document.querySelector("#highlighting");
	// Get and set x and y
	result_element.scrollTop = element.scrollTop;
	result_element.scrollLeft = element.scrollLeft;
}

function check_tab(element, event) {
	let code = element.value;
	if (event.key == "Tab") {
		/* Tab key pressed */
		event.preventDefault(); // stop normal
		let before_tab = code.slice(0, element.selectionStart); // text before tab
		let after_tab = code.slice(element.selectionEnd, element.value.length); // text after tab
		let cursor_pos = element.selectionStart + 1; // where cursor moves after tab - moving forward by 1 char to after tab
		element.value = before_tab + "\t" + after_tab; // add tab char
		// move cursor
		element.selectionStart = cursor_pos;
		element.selectionEnd = cursor_pos;
		update(element.value); // Update text to include indent
	}
}

function convertTextToHTML() {
	$.ajax({
		type: "GET",
		url: "/courses/id/",
		async: false,
		success: function (data) {
			id = parseInt(data);
		},
	});

	// when showing error link to something that looks like documentation but less good
	let courseData = inputtedText.match(/cd{\s.+/);
	if (courseData == null || courseData.length <= 0)
		return swal(
			"You need to enter course data",
			"You can use it like so:\ncd{ 'course name', 'course description{optional}', 'course image url' }cd",
			"error"
		);

	// Increment index by 2 so the program would be able to detect whitespace after course image
	courseData = courseData[0].substring(
		0,
		courseData[0].match(/\s}cd/).index + 2
	);
	courseData = getArgsFromSection(courseData, 3);

	if (courseData === undefined)
		return swal(
			"You didn't enter the course data section correctly",
			"You can use it like so:\ncd{ 'course name', 'course description{optional}', 'course image url' }cd",
			"error"
		);

	title = courseData[0][0];
	if (!textRegexp.test(title) || title.length < 3 || title.length > 30)
		return swal(
			"The title you entered is INVALID",
			'Your title needs to be between 3 and 30 characters.\nIt also cannot contain the character "',
			"error"
		);

	description = courseData[1][0];
	if (
		(!textRegexp.test(description) ||
			description.length < 15 ||
			description.length > 250) &&
		description.length > 0
	)
		return swal(
			"The description you entered is INVALID",
			'Your description needs to be between 15 and 250 characters.\nIt also cannot contain the character "',
			"error"
		);

	let imageUrl = courseData[2][0];
	imageUrl = checkImage(imageUrl);
	if (!imageUrl)
		return swal(
			"The course image URL you entered was INVALID",
			"",
			"error"
		);

	// Add every chapters text to `chapters` array
	let chaptersText = [];
	let lastChapter = inputtedText.match(/\s}cd/).index + 3;
	for (let i = 0; i < inputtedText.length; i++) {
		// Find the end of a chapter and use `lastChapter` variable to get start of the chapter
		if (inputtedText.substring(i, i + 2) == "}p") {
			chaptersText.push(inputtedText.substring(lastChapter, i + 1));
			lastChapter = i + 2;
		}
	}

	console.table(chaptersText)

	if (chaptersText.length <= 0)
		return swal("You need to enter at least one chapter", "", "error");

	let chapterObjects = [];

	for (let i = 0; i < chaptersText.length; i++) {
		let chapterObject = createChapter(chaptersText[i], i + 1);
		if (chapterObject == null) return null;
		chapterObjects.push(chapterObject);
	}

	sendCourseToServer(chapterObjects, imageUrl);
}

function checkImage(imageUrl) {
	try {
		$.ajax({
			type: "POST",
			url: "/courses/image",
			async: false,
			data: {
				url: imageUrl,
			},
			statusCode: {
				404: function () {
					imageUrl = false;
				},
			},
		});
	} catch (error) {}

	return imageUrl;
}

function createChapter(chapterText, chapterNumber) {
	let chapterObject = {
		chapterNumber: chapterNumber,
		title: null,
		image: null,
		html: null,
	};

	let chapterData = chapterText.match(/d{\s.+/);

	if (chapterData == null) {
		swal(
			`You need to enter chapter data for chapter ${chapterNumber}`,
			"You can use it like so:\nd{ 'chapter name', 'chapter image url' }d",
			"error"
		);
		return null;
	}
	// Increment index by 2 so it would be able to detect whitespace after chapter image
	chapterData = chapterData[0].substring(
		0,
		chapterData[0].match(/\s}d/).index + 2
	);
	chapterData = getArgsFromSection(chapterData, 2);

	if (chapterData === undefined) {
		swal(
			`You didn't enter chapter data correctly on chapter ${chapterNumber}`,
			"You can use it like so:\nd{ 'chapter name', 'chapter image url' }d",
			"error"
		);
		return null;
	}

	chapterObject.title = chapterData[0][0];
	if (
		!textRegexp.test(chapterObject.title) ||
		chapterObject.title.length < 3 ||
		chapterObject.title.length > 30
	) {
		swal(
			`The title you entered for chapter ${chapterNumber} is INVALID`,
			'Your title needs to be between 3 and 30 characters.\nIt also cannot contain the character "',
			"error"
		);
		return null;
	}

	chapterObject.image = chapterData[1][0];
	chapterObject.image = checkImage(chapterObject.image);
	if (!chapterObject.image) {
		swal(
			`The image URL you entered in chapter ${chapterNumber} was INVALID`,
			"",
			"error"
		);
		return null;
	}

	chapterObject.html = document.createElement("div");

	let questionNumber = 1;

	// Get all the sections from text using prefex
	let sectionsText = [...chapterText.matchAll(/([tq]){\s[\s\S]*?\s}\1/g)];

	if (sectionsText.length <= 0) {
		swal(
			"You need at least one section per chapter",
			`At chapter number ${chapterNumber}`,
			"error"
		);
		return null;
	}

	for (let i = 0; i < sectionsText.length; i++) {
		let section = createChapterSectionFromText(
			sectionsText[i],
			chapterNumber,
			i + 1,
			questionNumber
		);
		chapterObject.html.appendChild(section[0]);
		questionNumber = section[1];
	}

	// Create the finishing section of the chapter
	let chapterFinishingSection = document.createElement("div");
	chapterFinishingSection.className = "section " + ++sectionsText.length;
	chapterFinishingSection.appendChild(
		$.parseHTML(
			`<button onclick="course.finishLevel(${chapterNumber})" class="finish continue button small-button hover-anim">Finish</button>`
		)[0]
	);
	chapterObject.html.appendChild(chapterFinishingSection);

	chapterObject.html = chapterObject.html.outerHTML;

	return chapterObject;
}

function createChapterSectionFromText(
	sectionText,
	chapterNumber,
	sectionNumber,
	questionNumber
) {
	let chapterSection = null;

	switch (sectionText[1]) {
		case "t": {
			// Create text chapter section
			let textElement = createTextElement(sectionText[0]);
			chapterSection = finishCreationOfChapterSection(
				textElement,
				sectionNumber
			);
			break;
		}
		case "q": {
			// Create question chapter section
			let questionDiv = getQuestionDiv(
				sectionText[0],
				chapterNumber,
				questionNumber++
			);
			chapterSection = finishCreationOfChapterSection(
				questionDiv,
				sectionNumber
			);
			break;
		}
	}

	return [chapterSection, questionNumber];
}

function sendCourseToServer(chapterObjects, imageUrl) {
	// Add course to server
	$.ajax({
		url: "/courses",
		type: "POST",
		data: {
			courseId: id,
			title: title,
			description: description,
			image: imageUrl,
			chapters: JSON.stringify(chapterObjects),
		},
		success: function () {
			swal("Course Created Successfully", "", "success");
		},
	});
}

// `mainDiv` is the text or question div
function finishCreationOfChapterSection(mainElement, sectionNumber) {
	let chapterSection = document.createElement("div");
	chapterSection.className = "section " + sectionNumber++;
	chapterSection.appendChild(mainElement);

	// Add button for continuing in the chapter
	chapterSection.appendChild(
		$.parseHTML(
			'<button onclick="course.showNext()" class="continue button small-button hover-anim">Continue</button>'
		)[0]
	);

	return chapterSection;
}

function createTextElement(sectionText) {
	let textElement = document.createElement("div");
	// Get the text content from `sectionText` by finding the first "string" in the text following the t{ declaration
	let text = sectionText.match(stringRegexp);
	if (text == null) return;
	text = text[0];

	textElement.textContent = text;

	return textElement;
}

// Using chapterNumber and questionNumber only for assigning id to elements and for database
function getQuestionDiv(sectionText, chapterNumber, questionNumber) {
	// Extract question, answer and options from `sectionText` using regexp
	let questionText = sectionText.match(stringRegexp);
	let answerText = sectionText
		.substring(sectionText.indexOf("{c}"))
		.match(stringRegexp);
	let options = sectionText.substring(
		sectionText.indexOf("o{ "),
		sectionText.indexOf(" }o")
	);
	options = getArgsFromSection(options);
	if (options === undefined) {
		swal(
			`You need to enter answer options for question number ${questionNumber} in chapter ${chapterNumber}`,
			"",
			"error"
		);
		return null;
	}

	if (questionText == null || answerText == null || options == null)
		return null;
	options = options.map((option) => {
		return option[0];
	});
	questionText = questionText[0];
	answerText = answerText[0];

	question = createQuestionHtml(
		chapterNumber,
		questionNumber,
		questionText,
		answerText,
		options
	);
	return question;
}

function createQuestionHtml(
	chapterNumber,
	questionNumber,
	questionText,
	answerText,
	options
) {
	// Create parent question element
	let questionNode = document.createElement("fieldset");
	questionNode.id = questionNumber;
	questionNode.appendChild(document.createElement("legend"));
	questionNode.childNodes[0].innerHTML = questionText;

	// Create first set of options
	let starterOptions = shuffle(options).slice(0, 3);
	starterOptions.push(answerText);
	starterOptions = shuffle(starterOptions);

	// Create HTML for each option
	for (let i = 1; i <= starterOptions.length; i++) {
		let currentOption = document.createElement("label");
		currentOption.appendChild(document.createElement("input"));
		currentOption.childNodes[0].type = "radio";
		currentOption.childNodes[0].id = questionNumber + "#" + i;
		currentOption.childNodes[0].name = questionText + questionNumber;
		if (i == 1) currentOption.childNodes[0].checked = true;
		currentOption.appendChild(document.createElement("span"));
		currentOption.childNodes[1].innerHTML = starterOptions[i - 1];
		questionNode.appendChild(currentOption);
	}

	// Send question to server
	options.push(answerText);
	$.ajax({
		url: "/courses/options/",
		type: "POST",
		data: {
			course_id: id,
			chapterNumber: chapterNumber,
			question_id: questionNumber,
			optionsList: shuffle(options),
		},
	});
	$.post("/courses/answers/", {
		course_id: id,
		chapterNumber: chapterNumber,
		question_id: questionNumber,
		answer: answerText,
	});

	return questionNode;
}

function shuffle(array) {
	// Shuffles an array. from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}

function getArgsFromSection(sectionText, expectedArgNum = undefined) {
	let arguments = [...sectionText.matchAll(stringRegexp)];
	if (arguments === undefined || arguments.length <= 0) return undefined;
	if (expectedArgNum !== undefined && arguments.length !== expectedArgNum)
		return undefined;

	return arguments;
}