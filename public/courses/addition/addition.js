
var script = document.createElement('script');
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

const synth = window.speechSynthesis;
const COURSE_LANGUAGE = 'en-US';
 
var id = "addition";
var addition_course

var divs = document.getElementsByClassName('div');
var chapters = document.getElementsByClassName('chapter-div');
var buttons = document.getElementsByClassName('continue');
var voices = [];

function playText(id) {
    addition_course.playText(id)
}

function populateVoiceList() {
    addition_course.populateVoiceList()
}

function showNext() {
    addition_course.showNext()
}

function finishLevel(currentChapter) {
    addition_course.finishLevel(currentChapter)
}

function reset() {
    addition_course.reset()
}

window.onload = async (event) => {
    console.log('load')
    addition_course = new Course("Addition", "addition stuff", 1, 1, id, ['<!doctypehtml><html lang=en><meta charset=UTF-8><meta content="IE=edge"http-equiv=X-UA-Compatible><meta content="width=device-width,initial-scale=1"name=viewport><title>Addition Course</title><link href=../courses.css rel=stylesheet><script src=../../sketch.js></script><script src=addition.js id=addition></script><div><div class="div 1">I want to see this<img class=audio-img onclick=playText(1) src=../../images/speaker.png><br><button class="continue 1"onclick=showNext()>Continue</button></div><div class="div 2">Hello this is text about how addition works with<img class=audio-img onclick=playText(2) src=../../images/speaker.png> images and stuff i will work on it later<img class=audio-img onclick=playText(2.1) src=../../images/speaker.png><br><button class="continue 2"onclick=showNext()>Continue</button></div><div class="div 3">This is finishing text<img class=audio-img onclick=playText(3) src=../../images/speaker.png>><br><button class="continue 3"onclick=addition_course.finishLevel(1)>Finish</button></div></div>', '<!doctypehtml><html lang=en><meta charset=UTF-8><meta content="IE=edge"http-equiv=X-UA-Compatible><meta content="width=device-width,initial-scale=1"name=viewport><title>Document</title>']) // temp
    addition_course = init(id, addition_course)
}