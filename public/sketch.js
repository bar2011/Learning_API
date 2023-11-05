var courses = [];
var my_courses = [];

class Course {
    constructor(currentSection = 1, currentChapter = 1, id) {
        this.currentSection = currentSection;
        this.currentChapter = currentChapter;
        this.id = id;

        this.sections = document.getElementsByClassName('section');
        this.continueButtons = document.getElementsByClassName('continue');
        this.questions = document.getElementsByTagName('fieldset')
    }

    async showNext() {
        if (this.sections[this.currentSection - 1].childNodes[0].tagName === "FIELDSET") {
            if (!await this.checkQuestion()) return
        }
        this.currentSection++;
        this.showDivs();
        this.updateCourse()
    }

    async checkQuestion() {
        let chosenOption = null
        const questionFieldset = this.sections[this.currentSection - 1].childNodes[0]
        questionFieldset.childNodes.forEach(option => {
            let currentInputNode = option.childNodes[0]
            if (currentInputNode.checked) chosenOption = option
        })

        let isCorrectAnswer = false
        await $.ajax({
            type: 'POST',
            url: `/courses/answers/${this.id}?currentChapter=${this.currentChapter}&questionId=${questionFieldset.id}`,
            data: { option: chosenOption.childNodes[1].innerHTML },
            success: function (data, status) {
                isCorrectAnswer = data
            },
            async: "false"
        })
        if (!isCorrectAnswer) {
            chosenOption.childNodes[0].checked = false
            await this.generateQuestions()
        }
        return isCorrectAnswer
    }

    showDivs() {
        for (let i = 0; i < this.sections.length; i++) {
            if (this.sections[i].classList[1] <= this.currentSection) this.sections[i].style.display = 'block';
            if (this.sections[i].classList[1] < this.currentSection) this.continueButtons[i].style.display = 'none';
        }
    }

    async finishLevel(currentChapter) {
        // check that user is in last div and that this function is executed for this chapter
        if (currentChapter > this.currentChapter) return
        if (this.currentSection != this.sections.length) return
        
        // Update course twice:
        // One time to reset the current chapter and another time to move to the next one
        this.currentSection = 1
        this.updateCourse()

        this.currentChapter = currentChapter + 1;
        this.updateCourse()
        location.href = `./?site=progress&id=${this.id}`
    }

    reset() {
        if (confirm("Are you sure you want to reset all progress on this course?")) {
            this.currentChapter = 1
            this.currentSection = 1
            this.updateCourse()
        }
    }

    async generateQuestions() {
        for (let questionNumber = 1; questionNumber <= this.questions.length; questionNumber++) {
            let questionDiv = this.questions[questionNumber - 1]
            let questionChildDivs = questionDiv.getElementsByTagName('label')
            let options
            await $.ajax({
                type: "GET",
                url: `/courses/options/${this.id}?currentChapter=${this.currentChapter}&questionId=${questionNumber}`,
                success: function (data, status) {
                    options = data
                }
            });
            // Get actual options from list of {course_id, question_id, question_option}
            options = options.map((item) => {
                return item.question_option
            })

            this.generateQuestion(questionChildDivs, questionNumber, options)
        }
        this.updateCourse()
    }

    async generateQuestion(questionChildDivs, questionNumber, options) {
        var shownOptions = []
        // Add the actual answer to shownOptions array
        for (let i = 0; i < options.length; i++) {
            let isAnswer
            await $.ajax({
                type: "POST",
                url: `/courses/answers/${this.id}?currentChapter=${this.currentChapter}&questionId=${questionNumber}`,
                data: { option: options[i] },
                success: function (data, status) {
                    isAnswer = data
                }
            })
            if (isAnswer === true) {
                shownOptions.push(options[i])
                options.splice(i, 1)
                break
            }
        }
        // Add 3 more random options
        options = this.shuffle(options)
        for (let i = 0; i < 3; i++) {
            shownOptions.push(options[i])
        }

        shownOptions = this.shuffle(shownOptions)

        // Add the final options to the screen
        for (let i = 0; i < shownOptions.length; i++) {
            questionChildDivs[i].childNodes[1].innerHTML = shownOptions[i]
        }
    }

    updateCourse() {
        $.ajax({
            url: `/courses/${id}`,
            type: 'PUT',
            data: {
                currentSection: this.currentSection,
                currentChapter: this.currentChapter,
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