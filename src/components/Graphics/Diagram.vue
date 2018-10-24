<template>
    <div id="diagram">
        <div id="diagramSettings">
            Diagram Settings
        </div>
        <Graphics></Graphics>
    </div>
</template>

<script>
import Graphics from "./Graphics.vue";
export default {
    name: "Diagram",
    components: {
        Graphics
    }
}
</script>

