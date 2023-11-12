const express = require('express')
const app = express()
const coursesRouter = require('./routes/courses').router
const runSqlCode = require('./routes/courses').runSqlCode
const getImageFromLink = require('./routes/courses').getImageFromLink

// 200: OK 201: Created 204: No Content
// 400: Bad req 401: Unauthorized 403: Forbidden 404: Not Found 409: Conflict
// 500: Server err 501: unimplemented

/*
$.post('/courses/answers/id', {answer:'1'},function(data,status){
    alert('Data: ' + JSON.stringify(data)+ '\nStatus: ' + status)
})
*/

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static('./public'))

app.set('view engine', 'ejs')

app.get("/", async (req, res) => {
    switch (req.query.site) {
        case undefined: {
            let imageLinks = await runSqlCode("SELECT course_image FROM courses")
            imageLinks.forEach(link => {
                getImageFromLink(link.course_image)
            });
            let courses = await runSqlCode("SELECT * FROM courses");
            res.render('main', { courses })
            break;
        }
        case "createCourse": {
            res.render('createCourse')
            break;
        }
        case "intro": {
            const id = req.query.id
            if (parseInt(id) == undefined) return res.status(404).render('404')
            let title = await runSqlCode('SELECT course_title FROM courses WHERE course_id = ?', [id])
            if (title.length <= 0) return res.status(404).render('404')
            title = title[0].course_title
            res.render('intro', { title, id })
            break;
        }
        case "chapter": {
            if (parseInt(req.query.chapterNumber) == undefined) return res.status(404).render('404')
            if (parseInt(req.query.id) == undefined) return res.status(404).render('404')
            let chapterData = await runSqlCode('SELECT chapter_html, chapter_title, current_section FROM course_chapters WHERE course_id = ? AND chapter_number = ?',
                [req.query.id, req.query.chapterNumber])
            let courseData = await runSqlCode('SELECT current_chapter FROM courses WHERE course_id = ?', [req.query.id])
            if ((chapterData.length <= 0 || chapterData.length > 1) || (courseData.length <= 0 || courseData.length > 1)) return res.status(404).render('404')
            res.render('chapter', {
                chapterHtml: chapterData[0].chapter_html,
                title: chapterData[0].chapter_title,
                id: req.query.id,
                chapterProgress: chapterData[0].current_section,
                currentChapter: courseData[0].current_chapter
            })
            break;
        }
        case "progress": {
            let courseData = await runSqlCode('SELECT course_title, current_chapter FROM courses WHERE course_id = ?', [req.query.id])
            const chapters = await runSqlCode('SELECT chapter_title, chapter_image FROM course_chapters WHERE course_id = ?', [req.query.id])
            if (courseData.length <= 0 || chapters.length <= 0) return res.status(404).send(error404)

            res.render('progress', { courseTitle: courseData[0].course_title, currentChapter: courseData[0].current_chapter, chapters, id: req.query.id })
            break;
        }
        case "outro": {
            res.render('outro')
        }
        default:
            res.status(404).render('404')
    }
})

app.use('/courses', coursesRouter)

app.listen(3000, () => {
    console.log('Started server at http://localhost:3000')
})