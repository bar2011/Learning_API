var script = document.createElement('script');
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js';
document.getElementsByTagName('head')[0].appendChild(script);
 
var id = location.href.split('/');
id = id[id.length-2]
var course

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
    course = await init(id)
}