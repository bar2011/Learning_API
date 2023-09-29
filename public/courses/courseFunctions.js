var script = document.createElement('script');
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js';
document.getElementsByTagName('head')[0].appendChild(script);
 
var id = "addition";
var course

var divs = document.getElementsByClassName('div');
var chapters = document.getElementsByClassName('chapter-div');
var buttons = document.getElementsByClassName('continue');

function showNext() {
    course.showNext()
}

function finishLevel(currentChapter) {
    course.finishLevel(currentChapter)
}

function reset() {
    course.reset()
}

window.onload = async (event) => {
    console.log('load')
    course = new Course("Addition", "addition stuff", 1, 1, id, await $("body")[0].childNodes[3]) // temp
    course = init(id, course)
}