var courses = [];
var my_courses = [];

class Course {
    constructor (title, description, current_div=1, progress=1, id, html) {
        this.title = title;
        this.description = description;
        this.current_div = current_div;
        this.progress = progress;
        this.id = id;
        this.html = html
        
        this.divs = document.getElementsByClassName('div');
        this.chapters = document.getElementsByClassName('chapter-div');
        this.buttons = document.getElementsByClassName('continue');
        this.questions = document.getElementsByTagName('fieldset')
    }

    showNext() {
        this.current_div++;
        this.showDivs();
        this.updateCourse()
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
        // check that user is in last div and that this function is executed for this chapter
        if (currentChapter != this.progress) return
        if (this.current_div != this.divs.length) return

        this.progress++;
        this.current_div = 1
        this.updateCourse()
        location.href = './progress'
    }

    reset() {
        // Change this to PUT request
        if (confirm("Are you sure you want to reset all progress on this course?")) {
            $.ajax({
                url: `/courses/${this.id}`,
                type: 'DELETE'
            });
            location.reload();
        }
    }

    showDocument() {
        // Delete first statements (progress.html + p.html)
        if (location.href.endsWith("progress.html") || location.href.endsWith("progress")) return this.showProgressPage()
        if (location.href.endsWith("p.html") || location.href.endsWith("p")) this.showDivs(); // p = part
    }

    showProgressPage() {
        // Send to outro page if completed course
        if (this.progress > this.chapters.length) return location.href = "./outro"

        // Makes each chapter div send you to its corresponding part
        for (let i = 0; i < this.progress; i++) {
            this.chapters[i].onclick = () => {
                location.href = `./${(i + 1)}p`
            }
            this.chapters[i].getElementsByTagName('h1')[0].style.display = 'block'
        }

        // Adds closed lock image to not open chapters
        for (let i = this.progress; i < this.chapters.length; i++) {
            let img = document.createElement('img');
            img.setAttribute('src', '../../images/closed_lock.jpeg');
            this.chapters[i].appendChild(img);
        }
    }

    async generateQuestions() {
        for (let questionNumber=1; questionNumber<= this.questions.length; questionNumber++) {
            let questionDiv = this.questions[questionNumber-1]
            let questionChildDivs = questionDiv.getElementsByTagName('div')
            let options = await $.ajax({
                type: "GET",
                url: `/courses/options/${this.id},${this.progress}p${questionNumber}q`
            }).responseText;
            // Get actual options from list of {course_id, question_id, question_option}
            options = options.map((item) => {
                return item.question_option
            })

            this.generateQuestion(questionChildDivs, questionNumber, options)
        }
        this.updateCourse()
    }

    generateQuestion(questionChildDivs, questionNumber, options) {
        var shownOptions = []
        // Add the actual answer to shownOptions array
        for (let i = 0; i < options.length; i++) {
            let isAnswer = $.ajax({
                type: "POST",
                url: `/courses/answers/${this.id},${this.progress}p${questionNumber}q`,
                data: { option: options[i] }
            }).responseText
            if (isAnswer == "true") {
                shownOptions.push(options[i])
                options.splice(i, 1)
                break
            }
        }
        // Add 3 more random options
        options = this.shuffle(options)
        for (let i=0; i< 3; i++) {
            shownOptions.push(options[i])
        }

        shownOptions = this.shuffle(shownOptions)
        
        // Add the final options to the screen
        for (let i=0; i< shownOptions.length; i++) {
            questionChildDivs[i].childNodes[0].value = shownOptions[i]
            questionChildDivs[i].childNodes[1].innerHTML = shownOptions[i]
        }
    }

    updateCourse() {
        $.ajax({
            url: `/courses/${id}`,
            type: 'PUT',
            data: {
                title: this.title,
                description: this.description,
                current_div: this.current_div,
                progress: this.progress,
                html: this.html.join()
            }
        });
    }

    shuffle(array) {
        // Shuffles an array. from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        let currentIndex = array.length, randomIndex;
      
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

async function init(id) {
    let course
    await $.get(`/courses/${id}`, function(data, status) {
        let html = data.course_html.split(',')
        course = new Course(
            data.course_title,
            data.course_description,
            data.current_div,
            data.current_progress,
            data.course_id,
            html
        )
    });
    course.showDocument()
    return course;
}

// mystery: refreshing after loading questions doesn't work (error)