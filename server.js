const express = require('express')
const app = express()

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

app.get('/', (req, res) => {
    console.log('Here')
})

const coursesRouter = require('./routes/courses')

app.use('/courses', coursesRouter)

app.listen(3000, () => {
    console.log('started')
})