<template>
    <b-container>
        <b-row no-gutters>
            <b-col>
                <b-card header="Definition">
                <katex-element display-mode :expression = expression />
                </b-card>
            </b-col>
            <b-col>
                <b-card header="Code">
                <highlightjs autodetect :code = code />
                </b-card>
            </b-col>
            <b-col>
                <b-card header="Words">
                <slot></slot>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
export default {
    props: {
        expression: String,
        code: String
    }
}
</script>