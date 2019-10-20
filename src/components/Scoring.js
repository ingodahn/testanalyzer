export class Student {
  constructor(name) {
    this.name = name;
    this.lines = [];
    this.scores = new Object();
  }
  getScore(method, questions) {
    if (this.scores.hasOwnProperty(method)) return this.scores[method];
    let score = 0;
    switch (method) {
      case "maxQuestion": {
        questions.forEach(q => {
          score += q.scoreAttemptsOf(this.name, "max").totalScore;
        });
        break;
      }
      case "maxLine": {
        score = this.lines[0].lineScore;
        break;
      }
      case "avgLine": {
        score =
          this.lines.reduce((a, b) => a + b.lineScore, 0) / this.lines.length;
        break;
      }
      case "single": {
        score = this.lines;
      }
    }
    this.scores[method] = score;
    return score;
  }
}
