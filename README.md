<a name="readme-top"></a>

<br />
<h1 align="center">Mathology</h1>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



## About The Project

Mathology is an open source website, that works similar to [brilliant](https://brilliant.org). <br>
You can use it to:
* learn a new subject using a course somebody already created
* create your own courses about interesting subjects and show them to other people
* you can also use mathematical functions in your courses using [MathJax](https://www.mathjax.org) (a framework for creating mathematical functions from text similar to [Latex](https://latex-project.org))

I expect a lot of bugs in the software, as this is a project I've been working on for just a couple of months, in order to explore server-side programming, and learn how to use a database.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![MySQL][MySQL.com]][MySQL-url]
* [![NodeJS][NodeJS.org]][NodeJS-url]
* [![Figma][Figma.com]][Figma-url]
* [![Express][ExpressJS.com]][Express-url]
* [![JWT][JWT.io]][JWT-url]
* [![JQuery][JQuery.com]][JQuery-url]
* [![Latex][Latex-Project.org]][Latex-url]
* [![StackOverflow][StackOverflow.com]][StackOverflow-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* [MySQL](https://mysql.com)
* [Node JS](https://nodejs.org)
* npm (node package manager)
  ```sh
  npm install npm@latest -g
  ```

### Installation
<!-- Add instructions to create the database -->
1. Clone the repo
   ```sh
   git clone https://github.com/bar2011/Mathology
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a MySQL connection on localhost and run the `./database/create-database.sql` file.
4. Create a user with permissions to SELECT, INSERT, UPDATE and DELETE.
   Save the username and password.
5. Enter your URL, JWT SECRET, MySQL USER and PASSWORD in `.env`
   ```sh
    URL="WEBSITE URL (you can leave this as 0.0.0.0 to start on localhost)"
    USER="YOUR MYSQL USERNAME"
    PASSWORD="YOUR MYSQL USER PASSWORD"
    JWT_SECRET="YOUR JSON WEB TOKEN SECRET TEXT"
   ```
   Optimally the JWT_SECRET needs to be a lot of random characters.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
### Usage

You can start the application using `npm run start`. <br>
The command will do the following things:
1. Start the website and server on URL specified on .env and on port 3000 (for example, if the URL was localhost, the website will open on https://localhost:3000)
2. Try to connect to the MySQL database created on localhost
***
After you start the website and connect to it, you need to sign up.
After you finish with **that** you can start [creating your own courses](/courses.md).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
<!-- ## Roadmap

- [x] Add Changelog
- [x] Add back to top links
- [ ] Add Additional Templates w/ Examples
- [ ] Add "components" document to easily copy & paste sections of the readme
- [ ] Multi-language Support
    - [ ] Chinese
    - [ ] Spanish

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p> -->



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Contact

Bar Einav - bareinav46@gmail.com

Project Link: [https://github.com/bar2011/Mathology](https://github.com/bar2011/Mathology)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com
[JWT.io]: https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens
[JWT-url]: https://jwt.io
[ExpressJS.com]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com
[MySQL.com]: https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white
[MySQL-url]: https://mysql.com
[Figma.com]: https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white
[Figma-url]: https://figma.com
[StackOverflow.com]: https://img.shields.io/badge/-Stackoverflow-FE7A16?style=for-the-badge&logo=stack-overflow&logoColor=white
[StackOverflow-url]: https://stackoverflow.com
[Latex-Project.org]: https://img.shields.io/badge/latex-%23008080.svg?style=for-the-badge&logo=latex&logoColor=white
[Latex-url]: https://latex-project.org
[NodeJS.org]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[NodeJS-url]: https://nodejs.org