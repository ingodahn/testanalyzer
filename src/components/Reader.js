export class Question {
  constructor(name) {
    this.name = name;
    this.maxScore = "none";
    /*
     * answers is the object of scores achieved by students. Keys of scores are student names.
     * answers[studentName] is an object, the keys of which are line numbers.
     * answers[studentName][lineNr] is an array of objects {attempted: true|false, score: scoreValue}
     */
    this.answers = {};
  }

  getMaxScore() {
    if (this.maxScore == "none") {
      let ms = 0;
      Object.values(this.answers).forEach(snVal => {
        Object.values(snVal).forEach(lnVal => {
          lnVal.forEach(a => {
            if (ms < a.score) ms = a.score;
          });
        });
      });
      this.maxScore = ms;
      return this.maxScore;
    }
    // maxScore can be string if modified by input
    return Number(this.maxScore);
  }

  // Question has been presented to student in that line that many times
  presentedToInLine(studentName, lineNr) {
    if (
      this.answers.hasOwnProperty(studentName) &&
      this.answers[studentName].hasOwnProperty(lineNr)
    )
      return this.answers[studentName][lineNr].length;
    return 0;
  }

  // Question has been presented to student that many times
  presentedTo(studentName) {
    if (this.answers.hasOwnProperty(studentName)) {
      var lines = Object.keys(this.answers[studentName]);
      return lines.reduce(
        (a, b) => a + this.presentedToInLine(studentName, b),
        0
      );
    }
    return 0;
  }
  // Question has been presented that many times
  get presented() {
    var studentNames = Object.keys(this.answers);
    return studentNames.reduce((a, b) => a + this.presentedTo(b), 0);
  }

  // Question attemptedBy(studentNr): Student with nr studentNr has attempted question that often
  attemptedByInLine(studentName, lineNr) {
    if (
      this.answers.hasOwnProperty(studentName) &&
      this.answers[studentName].hasOwnProperty(lineNr)
    )
      return this.answers[studentName][lineNr].filter(a => a.attempted).length;
    return 0;
  }
  // Question attemptedBy(studentNr): Student with nr studentNr has attempted question that often
  attemptedBy(studentName) {
    if (this.answers.hasOwnProperty(studentName)) {
      var lines = Object.keys(this.answers[studentName]);
      return lines.reduce(
        (a, b) => a + this.attemptedByInLine(studentName, b),
        0
      );
    }
    return 0;
  }
  get attempted() {
    var studentNames = Object.keys(this.answers);
    return studentNames.reduce((a, b) => a + this.attemptedBy(b), 0);
  }

  scoreOfInLine(studentName, lineNr) {
    if (
      this.answers.hasOwnProperty(studentName) &&
      this.answers[studentName].hasOwnProperty(lineNr)
    )
      return this.answers[studentName][lineNr].reduce((a, b) => b.score, 0);
    return 0;
  }
  scoreOf(studentName) {
    if (this.answers.hasOwnProperty(studentName)) {
      var lines = Object.keys(this.answers[studentName]);
      return lines.reduce((a, b) => a + this.scoreOfInLine(studentName, b), 0);
    }
    return 0;
  }

  scoreAttemptsOf(studentName, method) {
    if (this.answers.hasOwnProperty(studentName)) {
      var lineContents = Object.values(this.answers[studentName]);
      var score = 0;
      switch (method) {
        case "max":
          score = lineContents.reduce(
            (a, b) =>
              Math.max(a, b.reduce((a1, b1) => Math.max(a1, b1.score), 0)),
            0
          );
          break;
        default:
          score = lineContents.reduce(
            (a, b) => a + b.reduce((a1, b1) => a1 + b1.score, 0),
            0
          );
      }
      return {
        attempts: lineContents.reduce(
          (a, b) => a + b.filter(j => j.attempted).length,
          0
        ),
        totalScore: score
      };
    }
    return { attempts: 0, totalScore: 0 };
  }

  // Adds student answers to question, returns, how often the student has asnwered this question in this line
  addStudentLineAnswer(studentName, lineNr, att, sco) {
    if (!this.answers.hasOwnProperty(studentName))
      this.answers[studentName] = new Object();
    if (!this.answers[studentName].hasOwnProperty(lineNr))
      this.answers[studentName][lineNr] = [];
    this.answers[studentName][lineNr].push({ attempted: att, score: sco });
    return this.answers[studentName][lineNr].length;
  }

  // Remove 1 line from 1 student
  removeStudentNameLine(studentName, LineNr) {
    if (this.answers.hasOwnProperty(studentName))
      delete this.answers[studentName][LineNr];
  }
  // Remove 1 student
  removeStudent(studentName) {
    delete this.answers[studentName];
  }

  // Number of times this question has been attempted
  get attempts() {
    //return this.answers.filter(this.attempted).length;
    return Object.keys(this.answers).reduce(
      (a, b) => a + this.attemptedBy(b),
      0
    );
  }
}

export class Line {
  constructor(nr) {
    this.lineNr = nr;
    this.lineName = "";
    // lineAnswers should contain objects {name, score,attempted}
    this.lineAnswers = [];
  }

  get participated() {
    return this.lineAnswers.filter(a => a.attempted).length;
  }

  get lineScore() {
    return this.lineAnswers.reduce((a, b) => a + b["score"], 0);
  }
}
