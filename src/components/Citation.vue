<template>
    <span>
        <b-link :id="popoverID" @click="show = !show"><sup>[{{id}}]</sup></b-link>
        <b-popover custom-class="citation" :show.sync="show" placement="righttop" :target="popoverID"><slot></slot></b-popover>
    </span>
</template>

<script>
export default {
    props: {
        id: String,
    },
    data() {
        return {
            show: false
        }
    },
    computed: {
        popoverID() {
            return "citation-popover-"+this.id
        }
    }
}
</script>