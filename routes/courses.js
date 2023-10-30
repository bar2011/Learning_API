const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const util = require('util')
const fs = require('fs')
const mysql = require('mysql2')
const http = require('http')
const axios = require('axios')

const readFile = util.promisify(fs.readFile)

var connection
connectToMySql()

async function connectToMySql() {
    // read file database.txt and extract database username and password from it
    data = (await readFile('./database.txt', 'utf8')).split('\r\n');
    let username = data[0];
    let password = data[1];

    // Connect to database
    connection = mysql.createConnection({
        host: "localhost",
        user: username,
        password: password
    });
    connection.connect(function (err) {
        if (err) throw err;
        console.log("Connected to MySQL database");
    });

    // Use database sql_learning_api when executing MySQL code
    runSqlCode("USE sql_learning_api")
}

// Run MySQL code using a promise rather then a nested callback
function runSqlCode(sql, args = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, args, (err, result) => {
            if (err) throw err
            resolve(result)
        })
    })
}

function getRequest(url) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${url}`, resp => {
            resolve(resp)
        })
    })
}

async function checkImageLink(imageUrl) {
    if (imageUrl.match(/.png$|.jpg$|.jpeg$/) == null) return 400

    var response

    try {
        response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    } catch {
        return 404
    }
    let error = (response.status != 200)

    if (error) return 404

    return 200
}

async function getImageFromLink(imageUrl) {
    if (await checkImageLink(imageUrl) != 200) return 400

    const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1)

    // From https://byby.dev/node-download-image#:~:text=This%20is%20a%20common%20task,that%20data%20to%20a%20file.
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    fs.writeFile('./public/images/' + imageName, response.data, (err) => {
        if (err) throw err
    });

    return 201
}

// 200 (def): OK 201: Created 204: No Content
// 400: Bad req 401: Unauthorized 403: Forbidden 404: Not Found 409: Conflict
// 500: Server err 501: unimplemented

// HTML for 404 error page
const error404 = '<!doctypehtml><title>Page not found</title><meta charset=utf-8><meta content="width=device-width,initial-scale=1,shrink-to-fit=no"name=viewport><script src=https://code.jquery.com/jquery-3.2.1.slim.min.js></script><style id=operaUserStyle></style><script src=./js/iro.min.js></script><link href=./img/favicon.ico rel=icon type=image/png><link href=./css/style.css rel=stylesheet><style></style><body><script>var ColorPicker=new iro.ColorPicker("#color-picker-container",{width:"200",color:"#4f86ed"})</script><div class="container grid-container"><div class="grid-item ui-block"><div class=center id=svgForyou><svg data-name=mainImage id=mainImage_create viewBox="0 0 171.2 81.5"xmlns=http://www.w3.org/2000/svg><style id=svgStyle>@import url(https://fonts.googleapis.com/css?family=Merriweather);.changeColor{fill:#4f86ed}#title{font-size:50%;font-family:Merriweather,serif}.cls-1{opacity:.3}.cls-7{opacity:.8}.cls-2{fill:#fff}.cls-10,.cls-11,.cls-12,.cls-14,.cls-16,.cls-3{fill:none}.cls-3{stroke:#5c7690}.cls-10,.cls-11,.cls-12,.cls-3{stroke-miterlimit:10}.cls-14,.cls-15,.cls-16,.cls-3{stroke-width:.5px}.cls-4{fill:#ffe1d9}.cls-5{fill:#ffcfbf}.cls-6{fill:#fecbb6}.cls-9{fill:#fecb02}.cls-10,.cls-12{stroke:#d26f51}.cls-10,.cls-11{stroke-width:.38px}.cls-11{stroke:#000}.cls-12{stroke-width:.19px}.cls-13{opacity:.45}.cls-14,.cls-15,.cls-16{stroke:#b0bec5;stroke-linejoin:round}.cls-15{fill:#edf0f2}.cls-16{stroke-linecap:round}.cls-17{font-family:\'PT Sans\',sans-serif;font-size:49.87px;font-weight:700}.cls-18{fill:#fffdbb;opacity:.5}.earMove{transition:all ease-in-out 2s;transform-origin:50% 50%;animation:earmove 1.5s linear infinite alternate}.faceMove{transition:all ease-in-out 2s;transform-origin:50% 50%;animation:move 1.5s linear infinite alternate}.neckMove{transition:all ease-in-out 2s;transform-origin:50% 50%;animation:neck 1.5s linear infinite alternate}@keyframes earmove{0%{transform:translateX(-.3px) translateY(.6px)}30%{transform:translateX(-.3px) translateY(.6px)}60%{transform:translateX(-.7px) translateY(0)}70%{transform:translateX(-.7px) translateY(-.3px)}100%{transform:translateX(-.7px) translateY(-.3px)}}@keyframes move{0%{transform:translateX(-.3px) translateY(.6px)}30%{transform:translateX(-.3px) translateY(.6px)}60%{transform:translateX(2px) translateY(0)}70%{transform:translateX(2px) translateY(-.3px)}100%{transform:translateX(2px) translateY(-.3px)}}@keyframes neck{0%{transform:translateY(.7px)}50%{transform:translateY(.7px)}100%{transform:translateY(0)}}</style><path class="changeColor cls-1"d=M46.62,52.5c5.78,4.9,21.14,8.4,39.19,8.4s33.41-3.5,39.19-8.4c-5.78-4.9-21.14-8.4-39.19-8.4S52.41,47.6,46.62,52.5Z id=c-1></path><path class=cls-2 d=M99.73,47.71H68.65a7.13,7.13,0,0,0-7.13,7.13V60a152.58,152.58,0,0,0,24.3,1.83,157.87,157.87,0,0,0,21.05-1.35V54.84A7.13,7.13,0,0,0,99.73,47.71Z></path><path class=cls-3 d=M123.56,55.81C115,58.94,101.27,61,85.81,61c-26,0-47-5.71-47-12.76,0-3.45,5.05-6.58,13.25-8.88></path><path class=cls-3 d=M55.37,38.47a140,140,0,0,1,30.44-3c26,0,47,5.71,47,12.76,0,2.4-2.44,4.65-6.69,6.57></path><path class=cls-3 d=M53.41,38.95l.94-.24></path><path class=cls-4 d=M91.68,47.71l-.75-11.2L79.15,43.84l-1.69,3.87H75.79c0,3.36,3.76,6.08,8.4,6.08s8.4-2.72,8.4-6.08Z></path><path class="cls-5 neckMove"d=M78,46.53a27.19,27.19,0,0,0,6.41.82c3.1,0,7.11-2.19,7.11-2.19l-.42-6.2L79.15,43.84Z></path><polygon class=earMove points="92.59 32.22 92.59 28.5 76.77 27.71 76.77 32.22 92.59 32.22"></polygon><circle class="earMove cls-6"cx=78.06 cy=34.04 r=2.47></circle><path class=cls-4 d=M81.74,57.06,60.63,49.72h0A6.72,6.72,0,1,0,57.7,62.49H93.25C93.25,56.78,81.74,57.06,81.74,57.06Z></path><path class=cls-4 d=M77.46,25H90.92a0,0,0,0,1,0,0V39.38a6.73,6.73,0,0,1-6.73,6.73h0a6.73,6.73,0,0,1-6.73-6.73V25A0,0,0,0,1,77.46,25Z></path><rect class="changeColor cls-7"height=2.45 width=19.14 x=74.82 y=26.48 id=c-2 transform="translate(1.29 -3.65) rotate(2.49)"></rect><path class="changeColor cls-7"d=M84.36,18.69h.5a7.8,7.8,0,0,1,7.8,7.8v0a0,0,0,0,1,0,0H76.56a0,0,0,0,1,0,0v0A7.8,7.8,0,0,1,84.36,18.69Z id=c-3 transform="translate(1.06 -3.66) rotate(2.49)"></path><polygon class="changeColor cls-8"points="82.44 23.89 92.18 24.32 92.59 24.34 92.48 26.84 80.96 26.33 82.44 23.89"id=c-4></polygon><circle class="faceMove cls-9"cx=78.72 cy=23.73 r=3.73 transform="translate(51.58 101.34) rotate(-87.51)"></circle><circle class="faceMove cls-2"cx=78.72 cy=23.73 r=2.36 transform="translate(51.58 101.34) rotate(-87.51)"></circle><circle class="cls-4 earMove"cx=90.92 cy=34.04 r=2.47></circle><path class=cls-4 d=M112.2,53l-9.87-21.92-3-5.48-11.86-.22,7.42,3.35H91.55l5.82,4.58,2,22.26h0A6.72,6.72,0,1,0,112.2,53Z></path><ellipse class=faceMove cx=80.09 cy=33.12 rx=0.53 ry=0.59></ellipse><ellipse class=faceMove cx=86.34 cy=33.12 rx=0.53 ry=0.59></ellipse><polyline class="faceMove cls-10"points="84.19 31.08 81.74 37.01 84.39 37.01"></polyline><path class="faceMove cls-10"d=M83.06,40.36a4,4,0,0,1,2.75-1></path><line class="faceMove cls-11"x1=81.07 x2=78.47 y1=30.33 y2=30.58></line><line class="faceMove cls-11"x1=86.34 x2=88.15 y1=30.45 y2=31.08></line><line class=cls-12 x1=106.86 x2=110.99 y1=47.82 y2=46.11></line><line class=cls-12 x1=107.43 x2=111.55 y1=49.9 y2=48.19></line><line class=cls-12 x1=107.99 x2=112.11 y1=51.98 y2=50.27></line><g class=cls-13><rect class=cls-14 height=3.5 width=10.77 x=85.81 y=2.46></rect><rect class=cls-15 height=3.5 width=10.77 x=96.58 y=2.46></rect><rect class=cls-14 height=3.5 width=10.77 x=92.19 y=5.95></rect><line class=cls-16 x1=107.36 x2=109.63 y1=5.95 y2=5.95></line><line class=cls-16 x1=110.68 x2=111.57 y1=5.95 y2=5.95></line></g><g class=cls-13><rect class=cls-16 height=3.5 width=10.77 x=125 y=23.12></rect><rect class=cls-15 height=3.5 width=10.77 x=130.39 y=26.62></rect><rect class=cls-16 height=3.5 width=10.77 x=119.62 y=26.62></rect><line class=cls-16 x1=141.16 x2=145.73 y1=26.62 y2=26.62></line><line class=cls-16 x1=125 x2=115.4 y1=23.12 y2=23.12></line><line class=cls-16 x1=117.95 x2=115.4 y1=26.62 y2=26.62></line></g><g class=cls-13><rect class=cls-16 height=3.5 width=10.77 x=39.34 y=16.12></rect><rect class=cls-16 height=3.5 width=10.77 x=39.34 y=23.11></rect><rect class=cls-16 height=3.5 width=10.77 x=50.11 y=23.11></rect><rect class=cls-16 height=3.5 width=10.77 x=50.11 y=16.12></rect><rect class=cls-15 height=3.5 width=10.77 x=44 y=19.61></rect><rect class=cls-16 height=3.5 width=10.77 x=33.23 y=19.61></rect><line class=cls-16 x1=60.89 x2=65.51 y1=19.61 y2=19.61></line><line class=cls-16 x1=39.34 x2=35.46 y1=16.12 y2=16.12></line><line class=cls-16 x1=36.45 x2=33.23 y1=26.61 y2=26.61></line><line class=cls-16 x1=63.2 x2=65.51 y1=23.11 y2=23.11></line></g><polyline class=cls-3 points="115.4 58.12 115.4 38.27 120.2 37.01"></polyline><polyline class=cls-3 points="129.01 53.21 129.01 43.14 131.74 42.13"></polyline><path class=cls-3 d=M115.4,42.13a53.27,53.27,0,0,1,8,2A42,42,0,0,1,129,47></path><path class=cls-3 d=M115.4,47.34a53.27,53.27,0,0,1,8,2A42,42,0,0,1,129,52.22></path><path class=cls-3 d=M115.4,52.56a53.27,53.27,0,0,1,8,2l1,.42></path><path class="faceMove cls-18"d=M78.84,26.09l0-4.71L68.05,18.32a.91.91,0,0,0-.45-.13c-1.17,0-2.11,2.46-2.11,5.5s.95,5.5,2.11,5.5a.9.9,0,0,0,.44-.12Z></path><path class=cls-5 d=M57.7,62.49H93.25A3.67,3.67,0,0,0,92.92,61H53.43A6.69,6.69,0,0,0,57.7,62.49Z></path><path class=cls-12 d=M88.15,60.27s1.7.95,1.7,2.22></path><path class=cls-5 d=M101.81,61a6.68,6.68,0,0,0,8.51,0Z></path><polygon class=cls-5 points="90.92 30.25 77.46 29.69 77.46 28.64 90.92 29.22 90.92 30.25"></polygon><text id=title transform="matrix(1 0 0 1 44.7249 78)">404 Page not found</text></svg></div></div></div><script>var modal=document.getElementById("myModal"),span=document.getElementsByClassName("close")[0];span.onclick=function(){modal.style.display="none"},window.onclick=function(n){n.target==modal&&(modal.style.display="none")}</script><script>function svgDownload(e,t,n){contentType="data:image/svg+xml,",uriContent=contentType+encodeURIComponent(document.getElementById("svgTextArea").value),e.setAttribute("href",uriContent),e.setAttribute("download",t)}$("#inputChangetitle").keyup(function(){var e=$(this).val();$("#title").text(e)}).keyup(),ColorPicker.on("color:change",function(e,t){document.getElementById("c-1").style.fill=e.hexString,document.getElementById("c-2").style.fill=e.hexString,document.getElementById("c-3").style.fill=e.hexString,document.getElementById("c-4").style.fill=e.hexString}),$("#submitBtn").click(function(){modal.style.display="block",document.getElementById("svgTextArea").value=document.getElementById("svgForyou").innerHTML}),$("#submitBtn").click(function(){$("#dialog").dialog()})</script>'

router.post('/options', async (req, res) => {
    // If options with same course and question ID exist than the server can't create another set of options with the same ID
    if ((await getRequest(`/courses/options/${req.body.course_id}?chapterNumber=${req.body.chapterNumber}&questionId=${req.body.question_id}`)).statusCode == 200) return res.sendStatus(400)

    // Insert each option into course_options table
    for (let i = 1; i <= req.body.options_list.length; i++) {
        runSqlCode('INSERT INTO course_options VALUES (?, ?, ?, ?)', [req.body.course_id, req.body.chapterNumber, req.body.question_id + i, req.body.options_list[i - 1]])
    }
    res.sendStatus(201)
})
router.get('/options/:id', async (req, res) => {
    // Extract course and question id from id given in parameters and query
    let courseId = req.params.id
    let chapterNumber = req.query.chapterNumber
    let questionId = req.query.questionId

    if (courseId == null || chapterNumber == null || questionId == null) return res.sendStatus(400)

    // Select options
    let optionsList = await runSqlCode('SELECT * FROM course_options WHERE course_id = ? AND chapter_number = ? AND question_id REGEXP ?', [courseId, chapterNumber, '^'+questionId])

    if (optionsList.length <= 0) return res.status(404).send(error404)

    res.send(optionsList)
})

router.post('/answers', async (req, res) => {
    // If answer hash with same course and question ID exist than the server can't create another answer with the same ID
    if ((await getRequest(`/courses/answers/${req.body.course_id}?chapterNumber=${req.body.chapterNumber}&questionId=${req.body.question_id}`)).statusCode == 200) return res.sendStatus(400)

    try {
        // Hash answer gave by client
        const hashedAnswer = await bcrypt.hash("" + req.body.answer, 10)
        runSqlCode('INSERT INTO course_answers VALUES (?, ?, ?, ?)', [req.body.course_id, req.body.chapterNumber, req.body.question_id, hashedAnswer])
        res.sendStatus(201)
    } catch {
        res.sendStatus(500)
    }
})

router.get('/answers/:id', async (req, res) => {
    // Extract course and question id from id given in parameters and in query
    let courseId = req.params.id
    let chapterNumber = req.query.chapterNumber
    let questionId = req.query.questionId

    if (courseId == null || chapterNumber == null || questionId == null) return res.sendStatus(400)

    // Select answer hash
    let answerHash = await runSqlCode('SELECT * FROM course_answers WHERE course_id = ? AND chapter_number = ? AND question_id REGEXP ?', [courseId, chapterNumber, '^'+questionId])

    if (answerHash.length <= 0) return res.status(404).send(error404)

    res.send(answerHash)
})

router.post('/answers/:id', async (req, res) => {
    // Extract course and question id from id given in parameters and in query
    let courseId = req.params.id
    let chapterNumber = req.query.chapterNumber
    let questionId = req.query.questionId

    if (courseId == null || chapterNumber == null || questionId == null) return res.sendStatus(400)

    // Select answer hash
    let answerHash = await runSqlCode('SELECT * FROM course_answers WHERE course_id = ? AND chapter_number = ? AND question_id REGEXP ?', [courseId, chapterNumber, '^'+questionId])

    if (answerHash.length <= 0) return res.status(404).send(false)

    try {
        // Compare answer client gave with answer hash stored in database
        if (await bcrypt.compare("" + req.body.option, answerHash[0].answer_hash)) {
            res.send(true)
        } else {
            res.send(false)
        }
    } catch {
        res.sendStatus(500)
    }
})

router.post('/image', async (req, res) => {
    return res.sendStatus(await checkImageLink(req.body.url))
})

router.get('/:id/intro', async (req, res) => {
    let title = await runSqlCode('SELECT course_title FROM courses WHERE course_id = ?', [req.params.id])
    if (title.length <= 0) return res.status(404).send(error404)
    title = title[0].course_title
    res.send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta content="IE=edge" http-equiv="X-UA-Compatible"><meta content="width=device-width,initial-scale=1" name="viewport"><link href="../courses.css" rel="stylesheet"><link href="../../main.css" rel="stylesheet"><title>' + title + ' Course Intro</title></head><body><h1>Welcome to ' + title + '!</h1><h2>Press here to start →<button class="button small-button hover-anim" onclick=\'location.href="./1p"\'>Continue</button></h2></body></html>')
})

router.get('/:id/outro', async (req, res) => {
    // TODO: actually make this
    res.send("Completed course or something!")
})

router.get('/:id/progress', async (req, res) => {
    let courseTitle = await runSqlCode('SELECT course_title FROM courses WHERE course_id = ?', [req.params.id])
    const chapters = await runSqlCode('SELECT chapter_title FROM course_chapters WHERE course_id = ?', [req.params.id])
    if (courseTitle.length <= 0 || chapters.length <= 0) return res.status(404).send(error404)

    courseTitle = courseTitle[0].course_title
    const chapterCount = chapters.length
    let chapterText = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1" name="viewport"><title>' + courseTitle + ' Progress</title><link href="../courses.css" rel="stylesheet"><link href="../../main.css" rel="stylesheet"><script src="../../sketch.js"></script><script src="../courseFunctions.js"></script><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script></head><body><div class="reset-button"><button class="button small-button hover-anim" onclick="reset()">Reset</button></div>'
    for (let i = 1; i <= chapterCount; i++) {
        chapterText += '<div class="chapter ' + i + '"><h1>Chapter ' + i + ` - ${chapters[i-1].chapter_title}</h1></div>`
    }
    res.send(chapterText)
})

router.get('/:id/:part', async (req, res) => {
    if (!req.params.part.endsWith('p')) return res.status(404).send(error404)
    const html = await runSqlCode('SELECT chapter_html FROM course_chapters WHERE course_id = ? AND chapter_number = ?', [req.params.id, req.params.part.slice(0, -1)])
    if (html.length <= 0) return res.status(404).send(error404)

    let chapterHTML = '<link href="../courses.css" rel="stylesheet"><link href="../../main.css" rel="stylesheet"><script src="../../sketch.js"></script><script src="../courseFunctions.js"></script><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>' +
        html[0].chapter_html
    res.send(chapterHTML)
})

router.get('/id', async (req, res) => {
    const courses = await runSqlCode('SELECT course_id FROM courses')
    if (courses.length <=0) return res.send(1+'').status(200)
    res.send(courses.length+1+'').status(200)
})

router
    .route('/:id')
    .get(async (req, res) => {
        let course = await runSqlCode('SELECT * FROM courses WHERE course_id = ?', [req.params.id])
        if (course.length <= 0) return res.status(404).send(error404)
        res.send(course[0])
    })
    .put(async (req, res) => {
        // Check if course with that ID exist by trying to send a get request and checking the statusCode of result
        if ((await getRequest(`/courses/${req.params.id}`)).statusCode == 404) return res.status(404).send(error404)

        // Update course with values
        runSqlCode('UPDATE courses SET course_title = ?, course_description = ?, current_chapter = ? WHERE course_id = ?',
            [req.body.title, req.body.description, req.body.progress, req.params.id])
        res.sendStatus(204)
    })
    .delete(async (req, res) => {
        // Check if course with that ID exist by trying to send a get request and checking the statusCode of result
        if ((await getRequest(`/courses/${req.params.id}`)).statusCode == 404) return res.status(404).send(error404)

        // Delete course from main courses table
        runSqlCode('DELETE FROM courses WHERE course_id = ?', [req.params.id])
        // Delete course from other tables
        runSqlCode('DELETE FROM course_chapters WHERE course_id = ?', [req.params.id])
        runSqlCode('DELETE FROM course_answers WHERE course_id = ?', [req.params.id])
        runSqlCode('DELETE FROM course_options WHERE course_id = ?', [req.params.id])

        res.sendStatus(204)
    })

router.post('/', async (req, res) => {
    // If course with same ID exist than the server can't create another course with the same ID
    if ((await getRequest(`/courses/${req.body.id}`)).statusCode == 200) return res.sendStatus(400)

    req.body.chapters.forEach(chapter => {
        runSqlCode(`INSERT INTO course_chapters (course_id, chapter_number, chapter_title, chapter_image, chapter_html) VALUES (?, ?, ?, ?, ?)`, [req.body.courseId, chapter.chapterNumber, chapter.title, chapter.image, chapter.html])
    });

    // Insert a new course into courses table
    runSqlCode(`INSERT INTO courses (course_title, course_description, course_image) VALUES (?, ?, ?)`, [req.body.title, req.body.description, req.body.image])
    res.sendStatus(201)
})

module.exports = { router, runSqlCode, getImageFromLink }