<template>
    <b-col class="border">
        <b-form-group
            :description="description"
            :label="id"
            :v-for="id"
        >
        <b-button :variant="exists ? 'primary' : 'secondary'" v-if="optional" :pressed.sync="exists" v-on:click="set_exists()">{{name}}</b-button>
        <b-collapse v-model="exists">
            <b-input-group>
            <b-form-input number type="number" v-bind:value="temp" v-on:input="set_value($event)"></b-form-input>
            <template #append>
                <b-button variant="info" v-b-toggle:[id]>?</b-button>
            </template>
            <template #prepend>
                <b-form-select v-model = "tempType" :options="tempTypes"></b-form-select>
            </template>
            </b-input-group>
            <b-collapse :id = "id" right width = "min-content" sidebar-class = "border-left" title="Help">
                <slot></slot>
            </b-collapse>
        </b-collapse>
        </b-form-group>
    </b-col>
</template>

<script>
export default {
    name: "TemperatureInput",
    props: {modelValue: Number, name: String, optional: Boolean, id: String, disabled: Boolean, description: String},
    model: {
        prop: 'modelValue',
        event: 'update:modelValue'
    },
    data: function() {
        return {
            temp: 1111,
            tempType: "c",
            tempTypes: [
                { value: "c", text: "Celsius"},
                { value: "k", text: "Kelvins"},
                { value: "f", text: "Fahrenheit"},
                { value: "u", text: "Urists"},
            ],
            exists: true,
        }
    },
    mounted() {
        this.exists = !this.disabled
        this.set_exists()
    },
    methods: {
        set_value: function(event) {
            this.temp = event
            var trueTemp = Number(this.temp)
            if(this.tempType == "k")
                trueTemp -= 273.15
            if(this.tempType == "c" || this.tempType == "k")
                trueTemp = trueTemp * 1.8 + 32
            if(this.tempType != "u")
                trueTemp += 9968
            this.$emit('update:modelValue',Math.round(trueTemp))
        },
        set_exists: function() {
            if(this.optional) {
                this.$emit('update:exists', this.exists)
            }
        }
    },
}
</script>