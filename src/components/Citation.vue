<template>
    <span>
        <b-link :id="id" @click="show = !show">{{text}}</b-link>
        <b-popover :show.sync="show" placement="righttop" :target="id"><slot></slot></b-popover>
    </span>
</template>

<script>
export default {
    props: {
        id: String,
        text: String
    },
    data() {
        return {
            show: false
        }
    }
}
</script>