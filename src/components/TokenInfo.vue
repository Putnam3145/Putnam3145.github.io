<template>
    <b-card border-variant="transparent">

        <b-tabs card justified>
            <b-tab title = "Dwarf Fortress" title-item-class = "bg-science">
                <b-card-title>
                    <b-button block variant="primary" :href="dfwiki">Dwarf Fortress wiki</b-button>
                </b-card-title>
                <slot name="dwarf"></slot>
            </b-tab> 
            <b-tab title="Real Life" title-item-class="bg-science">
                <b-card-title>
                    <b-button block variant="primary" :href="href">Wikipedia</b-button>
                </b-card-title>
                <slot name="science"></slot>
            </b-tab> 
        </b-tabs>
    </b-card>
</template>

<script>
export default {
    props: {
        name: String,
        href: String,
        token: String
    },
    computed: {
        dfwiki() {
            return "https://dwarffortresswiki.org/index.php/DF2014:Material_definition_token#" + this.token
        }
    }
}
</script>