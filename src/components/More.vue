<template>
<div id="more" :class=warnLevel v-if="Layout == 'all' || warnLevel == 'warn_1'">
    <h2>Bei welchen Fragen wurden oft viele Punkte erreicht?</h2>
    <div v-if = 'Score.length != 0'>
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
                    <li v-for='item in questionSuccess' :key = item>{{ item }}</li>
                </ul>
                wurden im Mittel mehr als {{ tp }} erreicht.
            </p>
        </div>
        <b>Hinweis:</b> <span v-html="hint"></span>
    </div>
</div>
</template>

<script>
function avg(q) {
    var avgScore=0;
    var scores=q.scores;
    var len=scores.length;
    for (var i=0; i<len; i++) {
        avgScore += scores[i];
    }
    avgScore=avgScore/q.total;
    return avgScore;
}
export default {
    name: "more",
    data() {
        return {
            threshold: 0.8
        }
    },
    props: ["Score", "ComponentStatus", "Layout"],
    computed:  {
        questionSuccess: function () {
            var threshold=0.8;
            var questions=this.Score;
            var questionsNr=questions.length;
            var qs=[];
            for (var i=0; i< questionsNr; i++) {
                var qi=questions[i];
                if ((avg(qi)/qi.maxScore) > threshold) {
                    qs.push(qi.name);
                }
            }
            return qs;
        },
        warnLevel: function () {
            var s=this.ComponentStatus;
            switch(this.questionSuccess.length) {
                case 0: {
                    s['more'] = 'warn_0';
                    return "warn_0";
                }
                default: {
                    s['more'] = 'warn_1';
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
                return "Viele Studierende haben sehr viele Punkte erreicht. Woran kann das liegen? "+ist+" die "+frage+" zu leicht? Überlegen Sie, warum Sie diese "+frage+" in den Test aufgenommen haben. <dl><dt style='font-style:italic;'>Wollten Sie die Studierenden mit einem guten Ergebnis motivieren?</dt><dd>Dann ist das in Ordnung.</dd><dt style='font-style:italic;'>Wollten Sie überprüfen, ob die Studierenden die für das Kommende benötigten Vorkenntnisse haben?</dt><dd>Dann ist dieses Ergebnis eine schöne Bestätigung, aber vielleicht können die Studierenden ja sogar noch mehr? Vielleicht können Sie diese "+frage+" doch noch etwas schwerer machen? Eventuell könnten Sie auch die Anzahl der für diese "+frage+" vergebenen Punkte reduzieren.</dd><dt  style='font-style:italic;'>Wollten Sie die besonders schwachen Studierenden herausfinden, die selbst daran scheitern?</dt><dd>Verdeutlichen Sie den Studierenden den Wert der "+frage+", damit sie sich nicht überschätzen.</dd></dl>";
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
