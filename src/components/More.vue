<template>
<div id="more" :class=warnLevel>
    <h2>Bei welchen Fragen wurden oft viele Punkte erreicht?</h2>
    <div v-if="questionSuccess.length == 0">
        <p>Bei allen Aufgaben wurden im Mittel höchstens {{tp}} erreicht.
        </p>
    </div>
    <div v-if="questionSuccess.length == 1">
        <p>Bei der Aufgabe
            <ul>
                <li>{{questionSuccess[0]}}</li>
            </ul>
            wurden im Mittel mehr als {{ tp }} erreicht.
        </p>
    </div>
    <div v-if="questionSuccess.length > 1">
        <p>Bei den Aufgaben
            <ul>
                <li>{{questionSuccess[0]}}</li>
            </ul>
            wurden im Mittel mehr als {{ tp }} erreicht.
        </p>
    </div>
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
    name: "more",
    data() {
        return {
            threshold: 0.8
        }
    },
    props: ["Score"],
    computed:  {
        questionSuccess: function () {
            var threshold=0.8;
            var questions=this.Score;
            var questionsNr=questions.length;
            var qs=[];
            for (var i=0; i< questionsNr; i++) {
                if (avg(questions[i]) > threshold) {
                    qs.push(questions[i].name);
                }
            }
            return qs;            
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
                return "Viele Studierende haben sehr viele Punkte erreicht. Woran kann das liegen? "+ist+" die "+frage+" zu leicht? Überlegen Sie, warum Sie diese "+frage+" in den Test aufgenommen haben. Wollten Sie die Studierenden mit einem guten Ergebnis motivieren? Dann ist das in Ordnung. Wollten Sie überprüfen, ob die Studierenden die für das Kommende benötigten Vorkenntnisse haben?  Dann ist dieses Ergebnis eine schöne Bestätigung, aber vielleicht können die Studierenden ja sogar noch mehr? Vielleicht können Sie diese "+frage+" doch noch etwas schwerer machen?";
            } else {
                return 'So sollte es sein. Ihre Aufgaben sind nicht zu leicht.';
            }
            
        },
        tp: function () {
            return this.threshold*100+"% der Punkte";
        }
    }
}
</script>
