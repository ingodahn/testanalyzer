export class Question {
  constructor(name) {
    this.name = name;
    this.maxScore = 1;
    //scores is the array of scores achieved by students. scores[i]==[] iff question has not been presented to student i, otherwise scores[i] is the sequence of answers given by student (0 if not attempted)
    this.scores = [];
    //answers is the array of answers given by students. answers[i]==[] iff question has not been presented to student i, otherwise answers[i] is the sequence of answers given by student ('' if not attempted)
    this.answers = [];
  }

  getMaxScore() {
    // maxScore can be string if modified by input
    return Number(this.maxScore);
  }
  // Question has been presented to student that many times
  presentedTo(studentNr) {
    //return this.answers[studentNr] == "---" ? 0 : 1;
    return this.answers[studentNr].length;
  }
  // Question has been presented that many times
  get presented() {
    return this.answers.reduce((a, b) => a + b.length, 0);
  }
  // Question attemptedBy(studentNr): Student with nr studentNr has attempted question that often
  attemptedBy(studentNr) {
    return this.answers[studentNr].filter(j => j !== "").length;
  }
  get attempted() {
    return this.answers.reduce((a, b) => a + b.filter(j => j !== "").length, 0);
  }

  scoreOf(studentNr) {
    //return this.scores[studentNr];
    return this.scores[studentNr].reduce((a, b) => a + b, 0);
  }

  // Remove 1 student
  removeStudent(studentNr) {
    this.answers.splice(studentNr, 1);
    this.scores.splice(studentNr, 1);
  }

  // Number of times this question has been attempted
  get attempts() {
    //return this.answers.filter(this.attempted).length;
    return this.answers.reduce((a, b) => a + this.attemptedBy(b), 0);
  }
  /*
  // Average score
  avg() {
    //var maxScore = Number(q.maxScore);
    var maxScore = this.getMaxScore();
    var avgScore = 0;
    var len = this.scores.length;
    for (var i = 0; i < len; i++) {
      avgScore += this.scoreOf(i);
    }
    avgScore = avgScore / (maxScore * len);
    return avgScore;
  }
  */
}
