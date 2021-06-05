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
            <div v-if="complex">
                <token-info :name = "name" :href = "href" :token = "token">
                    <template #dwarf><slot name="dwarf"></slot></template>
                    <template #science><slot name="science"></slot></template>
                </token-info>
            </div>
            <div v-else>
                <slot></slot>
            </div>
        </b-collapse>
    </b-col>
</template>

<script>
import TokenInfo from "./TokenInfo.vue"

export default {
    components: { TokenInfo },
    name: "Token",
    props: {
        name: String,
        href: String,
        description: String,
        token: String,
        tokenValue: String,
        number: Boolean,
        type: String,
        placeholder: String,
        complex: Boolean
    },
}
</script>