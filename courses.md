# Create your own courses
Mathology supports users creating courses on their own with plain text.
<br>
The "course creation text" is built with two major sections:
## 1. The course data
here is an example course data:
```
cd{ 'The Basics of Math', 'Teaches the fundamentals of mathematics', 'https://i.pinimg.com/originals/ba/4b/e8/ba4be89a541b2f2fc4131c4e77df01d9.png' }cd
```

You can see that it's divided into three parts (arguments) by commas, and surrounded by ```cd{  }cd``` brackets.

* The first part is the course's title, which needs to apply to the following arguments:
  * A course's title needs to be between 3 and 30 characters long.
  * All characters except `'` are allowed.
<br><br>
* The second part of the course data is the course's description, which needs to apply to the following arguments:
  * A course's description needs to be between 15 and 250 characters long.
  * All characters except `'` are allowed.
<br>
  The description can be empty.
<br><br>
* The third (and final) part of the course data is the course's image URL.
<br>
  The only formats allowed are .png, .jpg and .jpeg
<br>
  The URL must end with the file type of the image.

## 2. The chapters
The second (and most important) part in the course creation text is the chapters of the course.
This part can be only one section, but usually it's a bunch of chapter section one after another.

Each chapter is surrounded with ```p{  }p``` (p for part), and inside the parentheses you need to have one chapter data section, and then a bunch of text/question sections to create the actual chapter.

### The Chapter Data
The only difference this section has from the course data is that there is no description for chapters.
Other than that, they're the absolute same.

A chapter data section is surrounded with ```d{  }d``` (d for data).

You **need** to have a chapter data section at the start of every chapter.

### The Text Section
This section just contains text for the user to see.

A text section is created as following: ```t{ '[your text]' }t```

### The Question Section
I think this one is the most complicated section.

This section is surrounded with ```q{  }q```, and it takes three arguments:
1. The question itself e.g. "What is 2 + 2?"
2. The correct answer. Before typing the correct answer you need to put {c} (c for correct).
3. The options. You can put any amount that you want (although it's recommended to put at least 3 options not including the correct answer). 3 of the options will be chosen randomly every time someone opens the chapter. You need to put the options inside a ```o{  }o```, separated by a comma.

A full question section would look like:
```
q{ '[your question]' {c} '[the correct answer]' o{ '[option1]', '[option2]', '[option3]' ... }o }q
```
<br><br>
You can combine the text and question sections to create a full chapter, and combine chapters to create a full course.

A full course would look like:
```
cd{ '[Course name]', '[Course Description]', 'https://course_image.png' }cd
p{
    d{ '[Name Of Chapter One]', 'https://chapter_image.png' }d
    t{ '[text]' }t
    q{ '[question]' {c} '[correct answer]'
        o{ '[option1]',
           '[option2]',
           '[option3]',
           '[option4]',
           '[option5]' }o
    }q
    [As much text and questions as you want]
}p
[As much chapters as you want]
```