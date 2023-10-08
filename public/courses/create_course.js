var maininput;
var text;
var id;

async function convertToHTML() {
    maininput = document.getElementById("main-input");
    text = maininput.value;
    let mainDivs = []
    id = prompt("Before converting to course, choose an ID for the course.")
    var skip = false;
    try {
        await $.ajax({
            type: 'GET',
            url: '/courses/'+id,
            success: function(result) {
                skip = true
                alert('Yaoasd man, you gotta try again with another ID, just remeber that the ID isn\'t the name so it doesn\'t have to be the same');
                throw new TypeError("Invalid ID");
            }
        });
    } catch {  }
    if (skip) return;
    let chapterIndexes = []
    for (let i=0; i< text.length; i++) {
        if (text.charAt(i) == 'p' && text.charAt(i+1) == '{') {
            chapterIndexes.push(i)
            mainDivs.push(document.createElement("div"))
        }
    }
    chapterIndexes.push(text.length)
    for (let i=0; i< chapterIndexes.length-1; i++) {
        let question_n = 0;
        let sectionNumber = 1;
        for (let j= chapterIndexes[i]; j < chapterIndexes[i+1]; j++) {
            if (text.charAt(j) == '{' && text.charAt(j+1) == ' ') {
                switch (text.charAt(j-1).toLowerCase()) {
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
    var course = new Course(id, "descwersuhnfuiosgedfb9iso", 1, 1, id, mainDivsString)
    $.post('/courses', { id: id, course: JSON.stringify(course) },
        function(data, status){
            // alert('Data: ' + data + '\nStatus: ' + status)
        }
    );
    console.log(course.html)
    for (let i=0; i< mainDivsString.length; i++) {
        $(course.html[i]).appendTo("body")
        $(document.createElement("br")).appendTo("body")
    }
}

function createTextDiv(indexStart) {
    let textDiv = document.createElement('div');
    let textWithAudio = createTextWithAudio(text.substring(indexStart, getIndexWithoutAudio(text, '}t', indexStart)))
    // for (let i=0; i< textWithAudio.length; i++) {
    //     // textDiv.appendChild(textWithAudio[i])
    // }
    textDiv.textContent = textWithAudio;
    return textDiv;
}

function createQuestionDiv(chapterNumber, questionNumber, indexStart) {
    let questionText = createTextWithAudio(text.substring(indexStart, getIndexWithoutAudio(text, '{c}', indexStart)))
    let answerText = createTextWithAudio(text.substring(getIndexWithoutAudio(text, '{c}', indexStart)+3, getIndexWithoutAudio(text, 'o{', indexStart)))
    let possibleAnswers = createTextWithAudio(text.substring(getIndexWithoutAudio(text, 'o{', indexStart)+2, getIndexWithoutAudio(text, '}o', indexStart)).split(', '))
    question = createQuestion(chapterNumber, questionNumber, questionText, answerText, possibleAnswers)
    return question;
    // return;
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
    let skip = false;
    possibleAnswers.push(answerText)
    $.post('/courses/options/', {id: id + chapterNumber + 'p' + questionNumber, options: JSON.stringify(shuffle(possibleAnswers))})
    $.post('/courses/answers/', {id: id + chapterNumber + 'p' + questionNumber, answer: answerText})
    .fail(async function() {
        skip = true;
        // await alert('Yo man, you gotta try again with another ID, just remeber that the ID isn\'t the name so it doesn\'t have to be the same\n' + id + questionNumber);
        // console.log(id + questionNumber)
        throw new TypeError("Invalid ID");
    });

    if (skip) return;
    return questionDiv;
}

function createTextWithAudio(plainText) {
    elementIndexes = [];
    elements = [];
    if (Array.isArray(plainText)) {
        plainText.forEach(textElement => {
            elementIndexes = (findAudioIndexes(textElement));
            for (let i=0; i< elementIndexes.length-1; i++) {
                let element;
                if (i == 0) {
                    element = document.createElement("text")
                    element.textContent = textElement.substring(0, elementIndexes[i]);
                    elements.push(element);
                } else if (i % 2 == 1) {
                    element = document.createElement("img");
                    element.src = "../../images/speaker.png";
                    element.classList.add("audio-img");
                    // element.onclick = "playText(" + (1 + ((i-1)/2)/10) + ")";
                    // element.addEventListener('click', playText(1 + ((i-1)/2)/10))
                    elements.push(element);
                } else {
                    element = document.createElement("text")
                    element.textContent = textElement.substring(elementIndexes[i-1], elementIndexes[i]);
                    elements.push(element);
                }
                $(element).appendTo("body");
            }
        });
    } else {
        elementIndexes = findAudioIndexes(plainText);
        for (let i=0; i< elementIndexes.length; i++) {
            let element;
            if (i == 0) {
                element = document.createElement("text")
                element.textContent = plainText.substring(0, elementIndexes[i]);
                elements.push(element);
            } else if (i % 2 == 1) {
                element = document.createElement("img");
                element.src = "../../images/speaker.png";
                element.classList.add("audio-img");
                element.onclick = "playText(" + (1 + ((i-1)/2)/10) + ")";
                elements.push(element);
            } else {
                element = document.createElement("text")
                element.textContent = plainText.substring(elementIndexes[i-1], elementIndexes[i]);
                elements.push(element);
            }
            $(element).appendTo("body");
        }
    }
    return plainText;
}

function findAudioIndexes(plainText) {
    let elementIndexes = [];
    let indexStart = 0;
    let currentIndex = plainText.indexOf("{a}", indexStart);
    elementIndexes.push(currentIndex);
    while (currentIndex != -1) {
        if (elementIndexes.length % 2 == 1) {
            indexStart = plainText.indexOf("{a}", indexStart)+3;
            currentIndex = indexStart;
            elementIndexes.push(currentIndex)
        } else {
            currentIndex = plainText.indexOf("{a}", indexStart);
            elementIndexes.push(currentIndex)
        }
    }
    return elementIndexes;
}

function getIndexWithoutAudio(textToSearchIn, searchString, indexStart) {
    let found = false;
    let currentFind = textToSearchIn.indexOf(searchString, indexStart)
    let currentIndexStart = currentFind+searchString.length;
    while (!found) {
        if (textToSearchIn.charAt(currentIndexStart) == 'a') {
            currentFind = textToSearchIn.indexOf(searchString, currentIndexStart);
            currentIndexStart = currentFind+1;
        }
        else if (textToSearchIn.charAt(currentFind-1) == 'a') {
            currentFind = textToSearchIn.indexOf(searchString, currentIndexStart);
            currentIndexStart = currentFind+1;
        }
        else {
            found = true;
        }
    }
    return currentFind;
}

function shuffle(array) {
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