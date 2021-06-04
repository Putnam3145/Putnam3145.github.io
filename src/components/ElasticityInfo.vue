<template>
    <b-card border-variant="transparent">
        <b-card-title>
            <b-button block variant="primary" :href="href">{{name}}</b-button>
        </b-card-title>
        <b-container>
            <b-row>
                <b-col>
                    <b-card bg-variant="dwarf" text-variant="light">
                        <b-card-title>In Dwarf Fortress</b-card-title>
                        <slot name="dwarf"></slot>
                    </b-card>
                </b-col> 
                <b-col>
                    <b-card>
                        <b-card-title>In real life</b-card-title>
                        <slot name="science"></slot>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </b-card>
</template>

<script>
export default {
    props: {
        name: String,
        href: String
    }
}
</script>