<template>
<div id="less" :class=warnLevel>
    <h2>Bei welchen Fragen wurden oft wenige Punkte erreicht?</h2>
    <p>{{ lessmsg }}</p>
    <div v-if = 'Score.length != 0'>
        <b>Hinweis:</b> {{ hint }}
    </div>
</div>
</template>

<script>
function avg(q) {
    var maxScore=q.maxScore;
    var avgScore=0;
    var scores=q.scores;
    var len=scores.length;
    for (var i=0; i<len; i++) {
        avgScore += scores[i];
    }
    avgScore=avgScore/(maxScore*len);
    return avgScore;
}
export default {
    name: "Less",
    props: ["Score"],
    data () {
        return {
        }
    },
    computed:  {
        questionSuccess: function () {
            var threshold=0.2;
            var questions=this.Score;
            var questionsNr=questions.length;
            var qs=[];
            for (var i=0; i< questionsNr; i++) {
                if (avg(questions[i]) < threshold) {
                    qs.push(questions[i].name);
                }
            }
            return qs;            
        },
        lessmsg: function () {
            var threshold=0.2;
            var msg='';
            var questions=this.Score;
            var questionsNr=questions.length;
            if (questionsNr == 0) {
                return msg;
            }
            var tp=threshold*100+"% der Punkte";
            var qs=this.questionSuccess;
            switch(qs.length) {
                case 0: {
                    return "Es wurden bei allen Aufgaben im Mittel mindestens "+tp+" erreicht.";
                }
                case 1: {
                    return "Bei Aufgabe "+qs[0]+" wurden im Mittel weniger als "+tp+" erreicht.";
                }
                default: {
                    return "Bei jeder der Aufgaben "+qs.join()+" wurden im Mittel weniger als "+tp+" erreicht.";
                }
            }
            
        },
        warnLevel: function () {
            switch(this.questionSuccess.length) {
                case 0: {
                    return "warn_0";
                }
                default: {return "warn_1";}
            }
        },
        hint: function () {
            if (this.warnLevel == 'warn_1') {
                var frage= 'Frage';
                var ist='Ist';
                if (this.questionSuccess.length > 1) {
                    frage='Fragen';
                    ist='Sind';
                }
                return "Viele Studierende haben damit Probleme. Woran kann das liegen? "+ist+" diese "+frage+" für alle eindeutig und verständlich formuliert? Haben die Studierenden das benötigte Wissen? Sprechen Sie mit den Studierenden darüber! Überlegen Sie, warum Sie diese "+frage+" in den Test aufgenommen haben. Wollten Sie den Studierenden ihr Wissensdefizit aufzeigen? Dies kann leicht demotivieren. Vielleicht können Sie diese "+frage+" in Teilaufgaben zerlegen, so dass die Studierenden schrittweise zur Lösung geführt werden?";
            } else {
                return 'So sollte es sein. Ihre Aufgaben sind nicht zu schwer.';
            }
            
        }
    }
}
</script>
