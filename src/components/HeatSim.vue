<template>
    <b-container>
        <b-row>
            <b-col>
                <b-form-checkbox :button-variant="running ? 'danger' : 'success'" button v-model = "running">{{running ? "Stop" : "Go"}}</b-form-checkbox>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-form-input number v-model = "temp_one" ></b-form-input>
                <b-form-input number disabled  v-model = "specHeat"></b-form-input>
            </b-col>
            <b-col>
                <b-form-input number v-model = "temp_two" ></b-form-input>
                <b-form-input number v-model = "other_spec_heat" placeholder = "SPEC_HEAT"></b-form-input>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
export default {
    name: "HeatSim",
    props: {
        specHeat: Number
    },
    data() {
        return {
            temp_one: 10000,
            temp_two: 10000,
            running: false,
            interval: null,
            other_spec_heat: null
        }
    },
    watch: {
        running(new_value) {
            if(!this.other_spec_heat) {
                this.other_spec_heat = this.specHeat
            }
            var heatsim = this;
            clearInterval(this.interval);
            if(new_value) this.interval = setInterval(() => heatsim.do_heat_transfer(), 10)
        }
    },
    methods: {
        do_heat_transfer() {
            const delta = (this.temp_two - this.temp_one)
            this.temp_two -= delta / this.other_spec_heat
            this.temp_one += delta / this.specHeat
            if(Math.abs(delta) < 1) {
                this.running = false
                if(this.other_spec_heat > this.specHeat) {
                    this.temp_two = Math.round(this.temp_two)
                    this.temp_one = this.temp_two
                } else {
                    this.temp_one = Math.round(this.temp_one)
                    this.temp_two = this.temp_one
                }
            } 
        }
    }
}
</script>