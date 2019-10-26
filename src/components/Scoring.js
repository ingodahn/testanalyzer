export class Student {
  constructor(name) {
    this.name = name;
    this.lines = [];
    this.scores = new Object();
  }

  getLineScore(line) {
    let ls = this.lines.filter(j => j.lineNr == line);
    if (ls.length) return ls[0].lineScore;
    else return 0;
  }

  getScore(mode, questions) {
    let method = "compulsory",
      score = 0;
    if (mode.multiLine) {
      method = mode.multiLineScore;
      if (this.scores.hasOwnProperty(method)) return this.scores[method];

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
    } else {
      score = this.lines[0].lineScore;
    }

    this.scores[method] = score;
    return score;
  }
}
