export class Question {
  constructor(name) {
    this.name = name;
    this.maxScore = "none";
    this.studentScoreAvg = { compulsory: "none", voluntary: "none" };
    this.maxStudentScoreAvg = { compulsory: "none", voluntary: "none" };
    /*
     * answers is the object of scores achieved by students. Keys of scores are student names.
     * answers[studentName] is an object, the keys of which are line numbers.
     * answers[studentName][lineNr] is an array of objects {attempted: true|false, score: scoreValue}
     */
    this.answers = {};
    this.studentScores = new Object();
  }

  getMaxScore() {
    if (this.maxScore == "none") {
      this.maxScore = Object.values(this.studentScores).reduce(
        (a, b) => Math.max(a, b.maxScore),
        0
      );
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
    return this.studentScores.hasOwnProperty(studentName)
      ? this.studentScores[studentName].presented
      : 0;
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
  // Question attemptedBy(studentNr): Student with name studentName has attempted question that often
  attemptedBy(studentName) {
    return this.studentScores.hasOwnProperty(studentName)
      ? this.studentScores[studentName].attempted
      : 0;
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
    return this.studentScores.hasOwnProperty(studentName)
      ? this.studentScores[studentName].totalScore
      : 0;
  }

  scoreAttemptsOf(studentName, method) {
    //if (this.answers.hasOwnProperty(studentName)) {
    if (this.studentScores.hasOwnProperty(studentName)) {
      let ss = this.studentScores[studentName];
      return {
        attempts: ss.attempts,
        totalScore: method == "max" ? ss.maxScore : ss.totalScore
      };
    }
    return { attempts: 0, totalScore: 0 };
  }
  //We take for each student the average score of all attempts under consideration
  // and then the average of these averages -
  //this prevents individual students with many attempts from dominating the statistics
  getStudentScoreAvg(questionScore) {
    if (this.studentScoreAvg[questionScore] == "none") {
      let ssa = Object.values(this.studentScores);
      let sz = 0,
        sn = 0,
        m = questionScore == "voluntary" ? "attempted" : "presented";
      ssa.forEach(s => {
        if (s[m]) {
          sz += s.totalScore / s[m];
          sn++;
        }
      });
      this.studentScoreAvg[questionScore] = sn ? sz / sn : 0;
    }
    return this.studentScoreAvg[questionScore];
  }
  getMaxStudentScoreAvg(questionScore) {
    if (this.maxStudentScoreAvg[questionScore] == "none") {
      let ssa = Object.values(this.studentScores);
      let sz = 0,
        sn = 0,
        vol = questionScore == "voluntary";
      ssa.forEach(s => {
        sz += s.maxScore;
        if (vol) {
          sn += s.attempted ? 1 : 0;
        } else {
          sn += s.presented ? 1 : 0;
        }
      });
      this.maxStudentScoreAvg[questionScore] = sn ? sz / sn : 0;
    }
    return this.maxStudentScoreAvg[questionScore];
  }

  // Adds student answers to question, returns, how often the student has asnwered this question in this line
  addStudentLineAnswer(studentName, lineNr, att, sco) {
    if (!this.answers.hasOwnProperty(studentName)) {
      this.answers[studentName] = new Object();
      this.studentScores[studentName] = new StudentScores();
    }
    let sScore = this.studentScores[studentName];
    sScore.presented++;
    if (att) sScore.attempted++;
    sScore.totalScore += sco;
    if (sco > sScore.maxScore) sScore.maxScore = sco;

    if (!this.answers[studentName].hasOwnProperty(lineNr))
      this.answers[studentName][lineNr] = [];
    this.answers[studentName][lineNr].push({ attempted: att, score: sco });

    return this.answers[studentName][lineNr].length;
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

/*
 StudentScores objects have keys
    * totalScore (sum of all scores achieved)
    * maxScore (maximum score achieved)
    * presented (how often was this question presented to this student)
    * attempted (how often was this question attempted by this student)
    * */
export class StudentScores {
  constructor() {
    this.totalScore = 0;
    this.maxScore = 0;
    this.presented = 0;
    this.attempted = 0;
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
