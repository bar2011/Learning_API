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

app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use(express.static('./public'))

app.set('view engine', 'ejs')

app.get("/", async (req, res) => {
    let imageLinks = await runSqlCode("SELECT course_image FROM courses")
    imageLinks.forEach(link => {
        getImageFromLink(link.course_image)
    });
    let courses = await runSqlCode("SELECT * FROM courses");
    res.render('index', { courses })
})

app.use('/courses', coursesRouter)

app.listen(3000, () => {
    console.log('Started server at http://localhost:3000')
})