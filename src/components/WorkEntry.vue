<template>
    <b-card>
        <b-card-title>
            <b-button block variant="primary" v-b-toggle:[name]>{{name}}</b-button>
        </b-card-title>
        <b-card-sub-title>
            {{blurb}}
        </b-card-sub-title>
        <b-collapse :id = "name">
        <b-card-text>
        <slot></slot>
        </b-card-text>
        <b-card-footer>
            <b-link :href="href">Link</b-link>
        </b-card-footer>
        </b-collapse>
    </b-card>
</template>

<script>
export default {
    props: {
        name: String,
        href: String,
        blurb: String
    }
}
</script>