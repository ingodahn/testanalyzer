<template>
<div id="less" :class=warnLevel>
    <h2>Bei welchen Fragen wurden oft wenige Punkte erreicht?</h2>
    <div v-if = 'Score.length != 0'>
        <div v-if="questionSuccess.length == 0">
            <p>Es wurden bei allen Aufgaben im Mittel mindestens {{ tp }} erreicht.
            </p>
        </div>
        <div v-if="questionSuccess.length == 1">
            <p>Bei der Aufgabe
                <ul>
                    <li>{{questionSuccess[0]}}</li>
                </ul>
                wurden im Mittel weniger als {{ tp }} erreicht.
            </p>
        </div>
        <div v-if="questionSuccess.length > 1">
            <p>Bei jeder der Aufgaben
                <ul>
                    <li v-for='item in questionSuccess' :key = item>{{ item }}</li>
                </ul>
                wurden im Mittel weniger als {{ tp }} erreicht.
            </p>
        </div>
            <b>Hinweis:</b> {{ hint }}
    </div>
</div>
</template>

<script>
function avg(q) {
    var maxScore=Number(q.maxScore);
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
    props: ["Score", "ComponentStatus"],
    data () {
        return {
            threshold: 0.2,
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
        warnLevel: function () {
            var s=this.ComponentStatus;
            switch(this.questionSuccess.length) {
                case 0: {
                        s['less']='warn_0';
                        return "warn_0";
                    }
                default: {
                        s['less']='warn_1';
                        return "warn_1";
                    }
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
                return "Viele Studierende haben damit Probleme. Woran kann das liegen? "+ist+" diese "+frage+" für alle eindeutig und verständlich formuliert? Haben die Studierenden das benötigte Wissen? Sprechen Sie mit den Studierenden darüber! Überlegen Sie, warum Sie diese "+frage+" in den Test aufgenommen haben. Wollten Sie den Studierenden ihr Wissensdefizit aufzeigen? Dies kann leicht demotivieren. Vielleicht können Sie diese "+frage+" in Teilaufgaben zerlegen, so dass die Studierenden schrittweise zur Lösung geführt werden? Sie könnten auch mehr Punkte für diese "+frage+" vergeben, um die besondere Schwierigkeit zu berücksichtigen (s. Abschnitt Fragen-Statistik).";
            } else {
                return 'So sollte es sein. Ihre Aufgaben sind nicht zu schwer.';
            }
            
        },
        tp: function () {
            return this.threshold*100+"% der Punkte";
        }
    }
}
</script>
