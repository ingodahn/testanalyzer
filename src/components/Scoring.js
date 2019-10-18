export class Student {
  constructor(name) {
    this.name = name;
    this.lines = [];
    this.scores = new Object();
  }
  getScore(method, questions) {
    if (isNaN(this.score[method])) {
      let score = 0;
      switch (method) {
        case "maxQuestion": {
          questions.forEach(q => (score += q.scoreAttemptsOf(name, "max")));
        }
      }
      this.score[method] = score;
      return score;
    }
    return this.score(method);
  }
}
