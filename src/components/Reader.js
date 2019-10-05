export class Question {
  constructor(name) {
    this.name = name;
    this.maxScore = 1;
    this.scores = [];
    this.answers = [];
  }

  getMaxScore() {
    // maxScore can be string if modified by input
    return Number(this.maxScore);
  }
  // Question has been presented to student that many times
  presentedTo(studentNr) {
    return this.answers[studentNr] == "---" ? 0 : 1;
  }
  // Question attemptedBy(studentNr): Student with nr studentNr has attempted question that often
  attemptedBy(studentNr) {
    let x = this.answers[studentNr];
    return x !== "" && x != "---" ? 1 : 0;
  }

  scoreOf(studentNr) {
    return this.scores[studentNr];
  }

  // Remove 1 student
  removeStudent(studentNr) {
    this.answers.splice(studentNr, 1);
    this.scores.splice(studentNr, 1);
  }

  attempted(x) {
    return x !== "" && x != "---";
  }

  // Number of times this question has been attempted
  get attempts() {
    return this.answers.filter(this.attempted).length;
  }
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
}
