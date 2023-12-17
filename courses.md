# Create your own courses
Learning API supports users creating courses on their own with plain text.
<br>
The "course creation text" is built with two major sections:
## 1. The course data
here is an example course data:
```
cd{ 'The Basics of Math', 'Teaches the fundamentals of mathematics', 'https://i.pinimg.com/originals/ba/4b/e8/ba4be89a541b2f2fc4131c4e77df01d9.png' }cd
```

You can see that it's divided into three parts by commas, and surrounded by ```cd{  }cd``` brackets.

* The first part is the course's title, which needs to apply to the following arguments:
  * A course's title needs to be between 3 and 30 characters long.
  * The special characters allowed are: \\", \\', \\{, \\}, (, ) and ?
  
  If the title wouldn't meet these arguments, the course will not be created.
<br><br>
* The second part of the course data is the course's description, which needs to apply to the following arguments:
  * A course's description needs to be between 15 and 250 characters long.
  * The special characters allowed are: \\", \\', \\{, \\}, (, ), ?, \\,
  
  If the description wouldn't meet these arguments, the course will not be created.
<br>
  The description can be empty.
<br><br>
* The third (and final) part of the course data is the course's image URL.
<br>
  The only formats allowed are .png, .jpg and .jpeg
<br>
  The URL must end with the file type of the image.

## 2. The chapters
The second section is the chapters of the course.
This isn't really a section, but a bunch of chapters one after another.

Each chapter is surrounded with ```p{  }p``` (p for part), and inside the parentheses you need to have one chapter data section and after that you can have text and questions, as much as you want.

### The Chapter Data
This section is very similar to the course data but with one difference.

That is that there is no description for chapters.
Other than that, it's the same as course data.

A chapter data section is surrounded with ```d{  }d``` (d for data).

You <b>need</b> to have a chapter data section at the start of every chapter.

### The Text Section
This section just contains text for the user to see.

A text section is created as following: ```t{ '[your text]' }t```

### The Question Section
I think this one is the most complicated section.

This section is surrounded with ```q{  }q```, and it takes three arguments:
1. The question itself e.g. "What is 2 + 2?"
2. The correct answer. Before typing the correct answer you need to put {c} (c for correct).
3. The options. You can put any amount that you want. 3 will be chosen randomly every time someone opens the chapter. You need to put the options inside a ```o{  }o```, separated by a comma.

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