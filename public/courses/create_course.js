let inputDiv;
let inputtedText;
let id;
let title;
let description;

$(document).ready(function() {
    inputDiv = document.getElementById("main-input");
})

async function convertTextToHTML() {
    // Get course ID by checking the number of courses (i.e. the ID of the final course) and adding 1
    await $.get("/courses", function(data, status){
        id = data.length+1
    })

    inputtedText = inputDiv.value;
    let chaptersHtmlArray = []

    title = prompt("Before creating the course, please choose a title for the course.\nThe title needs to be at least 3 characters long and at most 30 characters. Plus it can not contain any special characters in it")
    // Check if title meets requirements
    if (!/^[\w\d\s]+$/.test(title) || title.length < 3 || title.length > 30) return alert("The title you entered is invalid")
    if (confirm("Do you also want to create a description for this course?"))
    {
        // Same thing with description
        description = prompt("OK. Your description also can't contain special characters and needs to be at least 10 characters")
        if (!/^[\w\d\s]+$/.test(description) || description.length < 10 || description.length > 1000) return alert("The description you entered is invalid")
    }
    else description = null

    // Add every chapters text to `chapters` array
    // For every chapter, append a div element to `chaptersHtmlArray`
    // to build on top of that div the actual chapter HTML
    let chapters = []
    let lastChapter = 0
    for (let i=0; i< inputtedText.length; i++) {
        // Find the end of a chapter and use `lastChapter` variable to get start of the chapter
        if (inputtedText.substring(i, i+2) == "}p") {
            chapters.push(inputtedText.substring(lastChapter, i+1))
            lastChapter = i+2
            
            chaptersHtmlArray.push(document.createElement("div"))
        }
    }
    
    for (let i=0; i< chapters.length; i++) {
        let chapter = createChapter(chapters[i], i+1)
        chapter.forEach(chapterSection => {
            chaptersHtmlArray[i].appendChild(chapterSection)
        })
    }

    sendCourseToServer(chaptersHtmlArray)
}

function createChapter(chapterText, chapterNumber) {
    let chapterHtmlArray = [];

    let questionNumber = 1;
    let sectionNumber = 1;
    // Loop over every character in the chapter
    for (let j= 0; j < chapterText.length; j++) {
        // Check for an expression start and then check for the type of expression
        if (inputtedText.substring(j, j+2) == '{ ') {
            switch (inputtedText.charAt(j-1).toLowerCase()) {
                case 't': {
                    // Create text chapter section
                    let textDiv = createTextDiv(chapterText, j+1)
                    let chapterSection = createChapterSection(textDiv, sectionNumber++)
                    chapterHtmlArray.push(chapterSection)
                    break;
                }
                case 'q': {
                    // Create question chapter section
                    let questionDiv = getQuestionDiv(chapterText, chapterNumber, questionNumber++, j+1)
                    let chapterSection = createChapterSection(questionDiv, sectionNumber++)
                    chapterHtmlArray.push(chapterSection)
                    break;
                }
            }
        }
    }
    // Create the finishing section of the chapter
    let chapterFinishingSection = document.createElement('div')
    chapterFinishingSection.className = 'div ' + sectionNumber++
    chapterFinishingSection.appendChild($.parseHTML(`<button onclick="course.finishLevel(${chapterNumber})" class="finish continue">Finish</button>`)[0])
    chapterHtmlArray.push(chapterFinishingSection)

    return chapterHtmlArray
}

function sendCourseToServer(chapterHtmlArray) {
    let chapterStringArray = []
    // Add actual text instead of elements to `chapterStringArray`
    for (let i=0; i< chapterHtmlArray.length; i++) {
        chapterStringArray.push(chapterHtmlArray[i].outerHTML)
    }
    // Add course to server
    $.ajax({
        url: '/courses',
        type: 'POST',
        data: {
            title: title,
            description: description,
            html: chapterStringArray.join()
        }
    })
}

// `mainDiv` is the text or question div
function createChapterSection(mainDiv, sectionNumber) {
    let chapterSection = document.createElement('div')
    chapterSection.className = 'div ' + sectionNumber++
    chapterSection.appendChild(mainDiv)

    // Add button for continuing in the chapter
    chapterSection.appendChild(document.createElement('br'))
    chapterSection.appendChild($.parseHTML('<button onclick="showNext()" class="continue">Continue</button>')[0])

    return chapterSection
}

function createTextDiv(chapterText, indexStart) {
    let textDiv = document.createElement('div');
    // Get the text content from `chapterText`
    let text = chapterText.substring(indexStart, chapterText.indexOf('}t', indexStart))
    textDiv.textContent = text;
    return textDiv;
}

// Using chapterNumber and questionNumber only for assigning id to elements and for database
function getQuestionDiv(chapterText, chapterNumber, questionNumber, indexStart) {
    // Extracr question, answer and options from `chapterText`
    let questionText = chapterText.substring(indexStart, chapterText.indexOf('{c}', indexStart))
    let answerText = chapterText.substring(chapterText.indexOf('{c}', indexStart)+3, chapterText.indexOf('o{', indexStart))
    let options = chapterText.substring(chapterText.indexOf('o{', indexStart)+2, chapterText.indexOf('}o', indexStart)).split(', ')
    question = createQuestionHtml(chapterNumber, questionNumber, questionText, answerText, options)
    return question;
}

function createQuestionHtml(chapterNumber, questionNumber, questionText, answerText, options) {
    // Create parent question element
    let questionNode = document.createElement("fieldset");
    questionNode.id = id+'i'+chapterNumber+'p'+questionNumber+'q'
    questionNode.appendChild(document.createElement("legend"));
    questionNode.childNodes[0].innerHTML = questionText;

    // Create first set of options
    let starterOptions = shuffle(options).slice(0, 3);
    starterOptions.push(answerText)
    starterOptions = shuffle(starterOptions)

    // Create HTML for each option
    for (let i=1; i<= starterOptions.length; i++) {
        let currentDiv = document.createElement("div")
        currentDiv.appendChild(document.createElement("input"))
        currentDiv.childNodes[0].type = "radio"
        currentDiv.childNodes[0].id = id+'i'+chapterNumber+'p'+questionNumber+'q'+i+'o'
        currentDiv.childNodes[0].name = questionText + questionNumber
        currentDiv.childNodes[0].value = starterOptions[i-1]
        if (i==1) currentDiv.childNodes[0].checked = true
        currentDiv.appendChild(document.createElement("label"))
        currentDiv.childNodes[1].innerHTML = starterOptions[i-1]
        currentDiv.childNodes[1].htmlFor = id+'i'+chapterNumber+'p'+questionNumber+'q'+i+'o'
        questionNode.appendChild(currentDiv)
    }

    // Send question to server
    options.push(answerText)
    $.post('/courses/options/', {course_id: id, question_id: `${chapterNumber}p${questionNumber}q`, options_list: shuffle(options)})
    $.post('/courses/answers/', {course_id: id, question_id: `${chapterNumber}p${questionNumber}q`, answer: answerText})

    return questionNode;
}

function shuffle(array) {
    // Shuffles an array. from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}
/*
p{
t{ This is some text that I put here }t
q{ This is a qquesiotn {c} Hello o{cat, dog, house as, notebook jf, bot tle, monitor, flag, U בSA}o}q
}p
*/