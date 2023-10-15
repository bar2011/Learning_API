var inputDiv;
var inputtedText;
var id;
var title;

$(document).ready(function() {
    inputDiv = document.getElementById("main-input");
})

async function convertToHTML() {
    inputtedText = inputDiv.value;
    let mainDivs = []
    // Get course ID by checking the number of courses (i.e. the ID of the final course) and adding 1
    await $.get("/courses", function(data, status){
        id = data.length+1
    })

    title = prompt("Before creating the course, please choose a title for the course.\nThe title needs to be at least 3 characters long and contain no special characters in it")
    // Check if title meets requirements: doesn't contain special character and at least 3 characters long
    if (!/^[\w\d\s]+$/.test(title) || title.length < 3) return alert("The title you entered is invalid")
    console.log(`ID: ${id}\nTitle: ${title}`)

    let chapterIndexes = []
    for (let i=0; i< inputtedText.length; i++) {
        if (inputtedText.charAt(i) == 'p' && inputtedText.charAt(i+1) == '{') {
            chapterIndexes.push(i)
            mainDivs.push(document.createElement("div"))
        }
    }
    chapterIndexes.push(inputtedText.length)
    for (let i=0; i< chapterIndexes.length-1; i++) {
        let question_n = 0;
        let sectionNumber = 1;
        for (let j= chapterIndexes[i]; j < chapterIndexes[i+1]; j++) {
            if (inputtedText.charAt(j) == '{' && inputtedText.charAt(j+1) == ' ') {
                switch (inputtedText.charAt(j-1).toLowerCase()) {
                    case 't': {
                        let chapterSection = document.createElement('div')
                        chapterSection.className = 'div ' + sectionNumber++
                        chapterSection.appendChild(createTextDiv(j+1))
                        chapterSection.appendChild(document.createElement('br'))
                        chapterSection.appendChild($.parseHTML('<button onclick="showNext()" class="continue">Continue</button>')[0])
                        mainDivs[i].appendChild(chapterSection)
                        break;
                    }
                    case 'q': {
                        question_n+=1
                        // createQuestionDiv(qn, i+1)
                        let chapterSection = document.createElement('div')
                        chapterSection.className = 'div ' + sectionNumber++
                        chapterSection.appendChild(createQuestionDiv(i+1, question_n, j+1))
                        chapterSection.appendChild(document.createElement('br'))
                        chapterSection.appendChild($.parseHTML('<button onclick="showNext()" class="continue">Continue</button>')[0])
                        mainDivs[i].appendChild(chapterSection)
                        break;
                    }
                }
            }
        }
        let finishSection = document.createElement('div')
        finishSection.className = 'div ' + sectionNumber++
        finishSection.appendChild($.parseHTML('<button onclick="course.finishLevel(' + (i+1) + ')" class="finish continue">Finish</button>')[0])
        mainDivs[i].appendChild(finishSection)
    }
    let mainDivsString = []
    for (let i=0; i< mainDivs.length; i++) {
        mainDivsString.push(mainDivs[i].outerHTML)
    }
    $.ajax({
        url: '/courses',
        type: 'POST',
        data: {
            title: title,
            description: 'NULL',
            html: mainDivsString.join()
        }
    })
    for (let i=0; i< mainDivsString.length; i++) {
        $(mainDivsString[i]).appendTo("body")
        $(document.createElement("br")).appendTo("body")
    }
}

function createTextDiv(indexStart) {
    let textDiv = document.createElement('div');
    let text = inputtedText.substring(indexStart, inputtedText.indexOf('}t', indexStart))
    textDiv.textContent = text;
    return textDiv;
}

function createQuestionDiv(chapterNumber, questionNumber, indexStart) {
    let questionText = inputtedText.substring(indexStart, inputtedText.indexOf('{c}', indexStart))
    let answerText = inputtedText.substring(inputtedText.indexOf('{c}', indexStart)+3, inputtedText.indexOf('o{', indexStart))
    let possibleAnswers = inputtedText.substring(inputtedText.indexOf('o{', indexStart)+2, inputtedText.indexOf('}o', indexStart)).split(', ')
    question = createQuestion(chapterNumber, questionNumber, questionText, answerText, possibleAnswers)
    return question;
}

function createQuestion(chapterNumber, questionNumber, questionText, answerText, possibleAnswers) {
    let questionDiv = document.createElement("fieldset");
    questionDiv.id = id+chapterNumber+'p'+questionNumber
    questionDiv.appendChild(document.createElement("legend"));
    questionDiv.childNodes[0].innerHTML = questionText;
    let answers = shuffle(possibleAnswers).slice(0, 3);
    answers.push(answerText)
    answers = shuffle(answers)
    for (let i=1; i<= answers.length; i++) {
        let currentDiv = document.createElement("div")
        currentDiv.appendChild(document.createElement("input"))
        currentDiv.childNodes[0].type = "radio"
        currentDiv.childNodes[0].id = id+chapterNumber+'p'+questionNumber+'o'+i
        currentDiv.childNodes[0].name = questionText + questionNumber
        currentDiv.childNodes[0].value = answers[i-1]
        if (i==1) currentDiv.childNodes[0].checked = true
        currentDiv.appendChild(document.createElement("label"))
        currentDiv.childNodes[1].innerHTML = answers[i-1]
        currentDiv.childNodes[1].htmlFor = id+chapterNumber+'p'+questionNumber+'o'+i
        questionDiv.appendChild(currentDiv)
    }
    possibleAnswers.push(answerText)
    $.post('/courses/options/', {course_id: id, question_id: `${chapterNumber}p${questionNumber}q`, options_list: shuffle(possibleAnswers)})
    $.post('/courses/answers/', {course_id: id, question_id: `${chapterNumber}p${questionNumber}q`, answer: answerText})
    return questionDiv;
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