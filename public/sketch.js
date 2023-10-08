var courses = [];
var my_courses = [];

class Course {
    constructor (title, description, div, progress, id, html, lang='en-US', image=null) {
        this.title = title;
        this.description = description;
        this.div = div;
        this.progress = progress;
        this.id = id;
        // this.html = html.outerHTML;
        this.html = html
        
        this.current_div = 1
        this.divs = document.getElementsByClassName('div');
        this.chapters = document.getElementsByClassName('chapter-div');
        this.buttons = document.getElementsByClassName('continue');
        this.questions = document.getElementsByTagName('fieldset')
        this.synth = window.speechSynthesis;
        this.COURSE_LANGUAGE = lang;
        this.voices = [];

        this.final_answer = "null";
    }

    playText(id) {
        var text = ''
        let div = divs[Math.floor(id) - 1]
        for (let i = 0; i < div.childNodes.length; i++) {
            if (div.childNodes[i] == div.getElementsByTagName('img')[Math.floor((id - Math.floor(id)) * 10)])
                text = div.childNodes[i - 1].nodeValue
        }
        var utterThis = new SpeechSynthesisUtterance(text);
        switch (this.COURSE_LANGUAGE) {
            case 'en-US':
                utterThis.voice = voices[9];
                break;
            default:
                break;
        }

        utterThis.onend = function (event) {
            console.log("SpeechSynthesisUtterance.onend");
        };

        utterThis.onerror = function (event) {
            console.error("SpeechSynthesisUtterance.onerror");
        };


        utterThis.pitch = 1.0;
        utterThis.rate = 1.0;
        this.synth.speak(utterThis);
    }

    populateVoiceList() {
        var allVoices = this.synth.getVoices().sort(function (a, b) {
            const aname = a.name.toUpperCase();
            const bname = b.name.toUpperCase();

            if (aname < bname) {
                return -1;
            } else if (aname == bname) {
                return 0;
            } else {
                return +1;
            }
        });
        for (let i = 0; i < allVoices.length; i++) {
            if (allVoices[i].lang.startsWith(this.COURSE_LANGUAGE)) {
                this.voices.push(allVoices[i])
            }
        }
    }

    showNext() {
        this.current_div++;
        $.ajax({
            url: '/courses/'+id,
            type: 'PUT',
            data: {course: JSON.stringify(this)}
        });
        this.showDivs();
        $.ajax({type: "PUT", url: '/courses'+this.id, data: {course: this}})
    }

    showFinal() {
        // TODO: create this function to declare final_answer based on users answer (should only fire after the last question) + add shownext for questions
    }

    showDivs() {
        for (let i = 0; i < this.divs.length; i++) {
            if (this.divs[i].classList[1] <= this.current_div) this.divs[i].style.display = 'block';
            if (this.divs[i].classList[1] < this.current_div) this.buttons[i].style.display = 'none';
        }
    }

    async finishLevel(currentChapter) {
        console.log('check')
        var check = true
        try {
            await $.ajax({
                url: '/courses/answers/final',
                type: 'POST',
                data: {id: this.id, answer: this.final_answer},
                success: function(data) {
                    console.log(data)
                    if (data == false) check = false
                },
                statusCode: {
                    404: function() {
                        check = false
                    }
                }
            })
        } catch { }
        console.log(check)
        if (!check) {
            return
        }
        if (currentChapter==this.progress)
            this.progress++;
        try {
            await $.ajax({
                url: '/courses/'+this.id,
                type: 'PUT',
                data: {course: JSON.stringify(this)}
            });
        } catch { }
        location.href = './progress.html'
    }

    reset() {
        if (confirm("Are you sure you want to reset all progress on this course?")) {
            $.ajax({
                url: '/courses/'+this.id,
                type: 'DELETE'
            });
            location.reload();
        }
    }

    onload() {
        if (location.href.endsWith("progress.html") || location.href.endsWith("progress")) {
            console.log(this.progress)
            for (let i = 0; i < this.progress; i++) {
                this.chapters[i].onclick = () => {
                    location.href = "./" + (i + 1) + "p"
                }
                console.log(this.chapters[i].getElementsByTagName('h1')[0])
                this.chapters[i].getElementsByTagName('h1')[0].style.display = 'block'
            }
            for (let i = this.progress; i < this.chapters.length; i++) {
                let img = document.createElement('img');
                img.setAttribute('src', '../../images/open lock thing.jpeg');
                this.chapters[i].appendChild(img);
            }
            console.log(this.progress+'h')
        }
        if (!(location.href.endsWith("p.html") || location.href.endsWith("p"))) return; // p = part
        this.populateVoiceList();
        this.showDivs();
    }

    async getCourse() {
        let course
        await $.get("/courses/"+id, function(data, status){
            course = JSON.parse(data.course)
        })
        return course
    }

    generateQuestions() {
        for (let questionNumber=1; questionNumber<= this.questions.length; questionNumber++) {
            let questionDiv = this.questions[questionNumber-1]
            let childDivs = questionDiv.getElementsByTagName('div')


            let options = JSON.parse($.ajax({type: "GET", url: '/courses/options/'+this.id+this.progress+'p'+questionNumber, async: false}).responseText);
            options = this.shuffle(options)
            var finalOptions = []
            for (let i = 0; i < options.length; i++) {
                let isAnswer = false
                // add options[i] to post request or something
                isAnswer = $.ajax({type: "POST", url: '/courses/answers/'+this.id+this.progress+'p'+questionNumber, data: {answer:options[i]}, async: false}).responseText
                if (isAnswer == "true") {
                    finalOptions.push(options[i])
                    options.splice(i, 1)
                }
            }
            for (let i=0; i< 3; i++) {
                finalOptions.push(options[i])
            }
            finalOptions = this.shuffle(finalOptions)
            

            for (let i=0; i< finalOptions.length; i++) {
                childDivs[i].childNodes[0].value = finalOptions[i]
                childDivs[i].childNodes[1].innerHTML = finalOptions[i]
            }
        }
        $.ajax({type: "PUT", url: '/courses'+this.id, data: {course: this}})
    }

    shuffle(array) {
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
}

function init(id, course) { // course variable is temporary
    try {
        $.ajax({
            type: 'GET',
            url: '/courses/'+id,
            success: async function(result) {
                course.progress = (await course.getCourse()).progress
                console.log(await course.getCourse())
                console.log(course.progress+' hh')
                course.onload()
            },
            error: function(jqXHR, textStatus, errorThrown) { // temp
                $.post('/courses', {id: id, course: JSON.stringify(course)})
                course.onload()
            }
        })
    } catch {}
    return course;
}