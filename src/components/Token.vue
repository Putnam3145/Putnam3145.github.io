<template>
    <b-col class="border">
        <b-form-group
            :description="description"
            :label="token"
            :v-for="token"
        >
        <b-input-group>
        <b-form-input :placeholder = "placeholder" debounce = "500" :number = "number" :id="token" v-bind:value="tokenValue" v-on:input="$emit('input',$event)"  :type="type" ></b-form-input>
        <template #append>
            <b-button variant="info" v-b-toggle:[description]>?</b-button>
        </template>
        </b-input-group>
        </b-form-group>
        <b-collapse :id="description">
            <slot></slot>
        </b-collapse>
    </b-col>
</template>

<script>
export default {
    name: "Token",
    props: {
        description: String,
        token: String,
        tokenValue: String,
        number: Boolean,
        type: String,
        placeholder: String
    },
}
</script>