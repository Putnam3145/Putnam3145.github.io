<template>
<div>
<b-container fluid>
    <b-row>
    <b-col cols=8>
    <b-tabs v-model = "curTab" pills vertical card content-class="mt-3">
    <b-tab v-if="false" title = "Help">
        <div>
        Good sources for data on materials are:<br><br>
        <a href="http://www.matweb.com/index.aspx">Matweb</a><br>
        <a href="http://www.wolframalpha.com/">Wolfram Alpha</a><br>
        <a href="https://en.wikipedia.org/wiki/Main_Page">Wikipedia</a><br>
        <a href="http://www.webelements.com/">WebElements</a><br>
        If any properties are unavailable the game will use placeholders. However, if those properties happen to be strength, it would be best to estimate to the best of your ability, such as by using a similar material (E.G iron for cobalt). Even if you can find only one elastic modulus, this is no problem; Poisson's ratio can only be between -1 and 0.5 in DF terms, and a general rule of thumb can be followed: metals 0.3, woods 0.45, rock 0.25. Young's modulus tends to be available, but if it isn't... well, guess.
        </div>
    </b-tab>
    <b-tab title = "Game">
    <div class="input_category tab_content" style="grid-template-rows: repeat(2,min-content);">
        <token v-model = "name" token="STATE_NAME" description="The material's noun." placeholder="iron">
            Like "piles of {{name}}".
        </token>
        <token v-model = "adj" token="STATE_ADJ" description="The material's adjective." placeholder="iron">
            Like "{{adj}} long sword".
        </token>
        <token v-model = "color" token="COLOR" description="The material's color. Used in graphics as of steam release." placeholder="GRAY">
            A list of tokens is available <b-link href="https://dwarffortresswiki.org/index.php/DF2014:Color#Color_tokens">here.</b-link> I would have a drop-down with every color, but then I'd have to make a little raw parser so you can add your own arbitrarily, and so on. Horrible.
        </token>
        <token type = "number" number v-model.number = "matValue" token="MAT_VALUE" description="Item values are multiplied by this." placeholder="10">
            You can actually set this to a negative number, forcing others to pay you to take your garbage away. Fun facts.
        </token>
    </div>
    </b-tab>
    <b-tab title = "Thermal">
    <b-container>
        <b-row>
        <temperature-input v-model="melting" v-bind:exists.sync="melting_exists" name="Melting point" id="MELTING_POINT" description="The temperature at which this material becomes a liquid." optional>
            There's no special conditions that need to happen for melting. I've had materials I expected to be liquid freeze underground and thus be unusable. Keep these things in mind!
        </temperature-input>
        <temperature-input v-model="boiling" v-bind:exists.sync="boiling_exists" name="Boiling point" id="BOILING_POINT" description = "The temperature at which this material becomes a gas." optional>
            If you set this very low, an object of this material can still be made in reactions, but it'll boil instantly. Very useful for reactions.
        </temperature-input>
        </b-row>
        <b-row>
        <temperature-input v-model="heatdam" v-bind:exists.sync="heatdam_exists" name="Heat damage point" id="HEATDAM_POINT" description="Above this temperature, any item made of this material starts taking damage." optional disabled>
            Damage is tattering etc. This token is underused, I think.
        </temperature-input>
        <temperature-input v-model="colddam" v-bind:exists.sync="colddam_exists" name="Cold damage point" id="COLDDAM_POINT" description="Below this temperature, any item made of this material starts taking damage." optional disabled>
            Damage is tattering etc. This token is underused, I think.
        </temperature-input>
        </b-row>
        <b-row>
        <temperature-input v-model="ignition" v-bind:exists.sync="ignition_exists" name="Ignition point" id="IGNITION_POINT" description="Above this temperature, items made of this material catch fire." optional disabled>
            If you don't set a heatdam point along with this, you'll end up having perma-fires.
        </temperature-input>
        <token type = "number" number v-model.number = "specHeat" token = "SPEC_HEAT" description = "The specific heat capacity, in J/kg-K." placeholder="450">
            The unit is J/kg-K, but the way it actually works in-game is as follows: temperature is stored as a fixed point number and this is the denominator of the fractional part. When an object of one temperature interfaces with another, the hotter one loses fractional part equal to the temperature delta, and the colder one gains fractional part. This generally simulates specific heat pretty well, so that all works out.
            Input two temperatures here. They'll equalize over time, at 100 FPS, the default DF speed.
            <heat-sim :specHeat = specHeat></heat-sim>
        </token>
        </b-row>
    </b-container>
    </b-tab>
    <b-tab title="Mass">
    <div class = "tab_content input_category">
        <b-form-row>
        <token type = "number" number v-model.number = "solidDensity" token = "SOLID_DENSITY" description = "The density of the material when solid, in kilograms/meter^3." placeholder = "7850">
            This is actually one of the more important stats, both for blunt weapons and, surprisingly, armor. Armor of sufficient density can stop low-momentum attacks cold.
        </token>
        <token type = "number" number v-model.number = "liquidDensity" token = "LIQUID_DENSITY" description = "The density of the material when liquid." placeholder="6980">
            This only matters for hauling. Can't win 'em all.
        </token>
        </b-form-row>
        <token type = "number" number v-model.number = "molarMass" token = "MOLAR_MASS" description = "The molar of an atom of this material, in grams/mol." placeholder = "55485">
            Last I checked, even Toady seems somewhat baffled as to the provenance of this token. It should have to do with gases, but those do barely anything. Its presence in the raws does seem to line it up with SOLID_DENSITY and LIQUID_DENSITY.
        </token>
    </div>
    </b-tab>
    <b-tab title="Strength">
    <b-container>
        <b-form-row>
        <token type = "number" number v-model.number = "tensileYield" token = "TENSILE_YIELD" description = "The tension at which this material no longer bounces back when stretched." placeholder="155000">
            Only matters for edged creature attacks that latch, specifically during shaking. Higher is better.
        </token>
        <token type = "number" number v-model.number = "tensileFracture" token = "TENSILE_FRACTURE" description = "The tension at which this material will tear when stretched." placeholder = "310000">
            Ditto. Funnily enough, in real life, this is the usual strength category tested--"specific strength" is ultimate tensile strength divided by solid density. For your material, that's {{ tensileFracture / solidDensity }}!
        </token>
        </b-form-row>
        <b-form-row>
        <token type = "number" number v-model.number = "shearYield" token = "SHEAR_YIELD" description = "The stress at which this material no longer bounces back when sheared." placeholder="155000">
            Technically involved in edged attacks, but since SHEAR_FRACTURE is multiplied by the contact area, which is 5 at the very least, it doesn't matter except for bolts, and even then only barely. If you mod in ammo that has a size of 1, this will matter, otherwise not so much. Should be noted that this and shear fracture are copied to BENDING and TORSION which matter for joint locks and latching blunt attacks (none in vanilla), respectively.
        </token>
        <token type = "number" number v-model.number = "shearFracture" token = "SHEAR_FRACTURE" description = "The stress at which this material will break when sheared." placeholder = "310000">
            This is the most important material property for bladed weapons. Nothing else comes even close. The higher this stat is, the better.
        </token>
        </b-form-row>
        <b-form-row>
        <token type = "number" number v-model.number = "compressiveYield" token = "COMPRESSIVE_YIELD" description = "The pressure at which this material no longer bounces back when compressed." placeholder = "542500">
            This only matters for pinching and strangulation. However, it's copied to IMPACT_YIELD, which matters quite a lot: a material with a low IMPACT_YIELD can be completely deflected by armor with high density (imagine a semi-solid material going <i>splat</i> against a wall). Interestingly enough, though, a high impact yield actually makes armor <i>worse</i>--the material coefficient in blunt armor calculations is equal to 2*IMPACT_FRACTURE - IMPACT_YIELD--for this material, {{2*compressiveFracture - compressiveYield}}. I would assume this is to represent the fact that a low IMPACT_FRACTURE allows armor to "absorb impact" more--any denting is energy dissipated into the armor, rather than into your squishy, squishy body.
        </token>
        <token type = "number" number v-model.number = "compressiveFracture" token = "COMPRESSIVE_FRACTURE" description = "The pressure at which this material will break when compressed." placeholder = "1085000">
            This, shear fracture and to a lesser extent density are the only properties that matter for armor, period. Everything else is related to skill, weapon and armor themselves. The higher the better, for this and shear fracture. It should also be noted that I'm not sure compressive strength is really a thing. Things don't break if you compress them hard enough, they, like, get all degenerate. Whatever.
        </token>
        </b-form-row>
        <b-form-row>
        <token type = "number" number v-model.number = "maxEdge" token="MAX_EDGE" description="How sharp the material can get." placeholder="10000">
            What it says on the tin. Sharper is better for sharp weapons. As straightforward as these things get. Consider this a flat "momentum" multiplier for edged weapons.
        </token>
        </b-form-row>
    </b-container>
    </b-tab>
    <b-tab lazy title="Elasticity">
        <elasticity v-model="elasticity"></elasticity>
    </b-tab>
    <b-tab title="Simulation">
        <combat-sims :name = "solidName" :solidDensity = "solidDensity"
        :impactYield = "impactYield" :impactFracture = "impactFracture"
        :shearYield = "shearYield" :shearFracture = "shearFracture"
        :maxEdge = "maxEdge"></combat-sims>
    </b-tab>
    </b-tabs>
            </b-col>
    <b-col>
                <b-button-toolbar>
            <b-form-checkbox button :button-variant="shouldShowAll ? 'success' : 'danger'" v-model = "shouldShowAll">
                Show{{shouldShowAll ? 'ing' : ''}} all
            </b-form-checkbox>
            <b-button v-if = "showAll" @click="copyRaw" variant="primary">{{ buttonText }}</b-button>
        </b-button-toolbar>
<pre style="text-align:left;" id='result'><span v-show="showGame"><span v-if="name==adj">
[STATE_NAME_ADJ:ALL_SOLID:{{ solidName }}]
[STATE_NAME_ADJ:LIQUID:{{ liquidName }}]
[STATE_NAME_ADJ:GAS:{{ gasName }}]</span><span v-else>
[STATE_NAME:ALL_SOLID:{{ solidName }}]
[STATE_NAME:LIQUID:{{ liquidName }}]
[STATE_NAME:GAS:{{ gasName }}]
[STATE_ADJ:ALL_SOLID:{{ solidAdj }}]
[STATE_ADJ:LIQUID:{{ liquidAdj }}]
[STATE_ADJ:GAS:{{ gasAdj }}]</span>
[DISPLAY_COLOR:0:7:1]
[BUILD_COLOR:0:7:1]
[MATERIAL_VALUE:{{ Math.round(matValue) }}]</span><span v-show = "showThermal">
[SPEC_HEAT:{{ Math.round(specHeat) }}]<span v-if="melting_exists">
[MELTING_POINT:{{ Math.round(melting) }}]</span><span v-if="boiling_exists">
[BOILING_POINT:{{ Math.round(boiling) }}]</span><span v-if="ignition_exists">
[IGNITE_POINT:{{ Math.round(ignition) }}]</span><span v-if="colddam_exists">
[COLDDAM_POINT:{{ Math.round(colddam) }}]</span><span v-if="heatdam_exists">
[HEATDAM_POINT:{{ Math.round(heatdam) }}]</span></span><span v-show = "showStrength">
<span v-if="reasonableEdged && maxEdge >= 10000">[ITEMS_WEAPON]</span><span v-if="solidDensity < 10000 && impactFracture > 100000">[ITEMS_WEAPON_RANGED]</span><span v-if="solidDensity * shearFracture > 500000000">[ITEMS_AMMO]</span><span v-if="impactFracture > 500000">[ITEMS_DIGGER]
</span><span v-if="reasonableEdged && bluntDefense > 1000000">[ITEMS_ARMOR]
</span><span v-if="magmaSafe && bluntDefense > 500000">[ITEMS_ANVIL]
</span></span><span v-show = "showGame">[ITEMS_METAL]
[ITEMS_HARD]
[ITEMS_SCALED]
[ITEMS_BARRED]</span><span v-show="showMass">
[SOLID_DENSITY:{{ Math.round(solidDensity) }}]
[LIQUID_DENSITY:{{ Math.round(liquidDensity) }}]
[MOLAR_MASS:{{ Math.round(molarMass) }}]</span><span v-show = "showStrength">
[IMPACT_YIELD:{{ Math.round(impactYield) }}]
[IMPACT_FRACTURE:{{ Math.round(impactFracture) }}]
[IMPACT_STRAIN_AT_YIELD:{{ Math.round(impactElasticity) }}]
[COMPRESSIVE_YIELD:{{ Math.round(compressiveYield) }}]
[COMPRESSIVE_FRACTURE:{{ Math.round(compressiveFracture) }}]
[COMPRESSIVE_STRAIN_AT_YIELD:{{ Math.round(compressiveElasticity) }}] bulk modulus {{elasticity.bulk / 1000}} GPa
[TENSILE_YIELD:{{ Math.round(tensileYield) }}]
[TENSILE_FRACTURE:{{ Math.round(tensileFracture) }}]
[TENSILE_STRAIN_AT_YIELD:{{ Math.round(tensileElasticity) }}] young's modulus {{elasticity.young / 1000}} GPa
[TORSION_YIELD:{{ Math.round(shearYield) }}]
[TORSION_FRACTURE:{{ Math.round(shearFracture) }}]
[TORSION_STRAIN_AT_YIELD:{{ Math.round(shearElasticity) }}]
[SHEAR_YIELD:{{ Math.round(shearYield) }}]
[SHEAR_FRACTURE:{{ Math.round(shearFracture) }}]
[SHEAR_STRAIN_AT_YIELD:{{ Math.round(shearElasticity) }}] shear modulus {{elasticity.shear / 1000}} GPa
[BENDING_YIELD:{{ Math.round(bendingYield) }}]
[BENDING_FRACTURE:{{ Math.round(bendingFracture) }}]
[BENDING_STRAIN_AT_YIELD:{{ Math.round(bendingElasticity) }}]
[MAX_EDGE:{{ Math.round(maxEdge) }}]</span><span v-show="showGame">
[STATE_COLOR:ALL_SOLID:{{ color }}]</span>
</pre>
    </b-col>
</b-row>
    </b-container>
</div>
</template>
<script>
import Elasticity from "@/components/Elasticity.vue"
import TemperatureInput from "@/components/TemperatureInput.vue"
import Token from "@/components/Token.vue"
import CombatSims from "@/components/CombatSims.vue"
import HeatSim from "@/components/HeatSim.vue"
export default ({
    components: {
        Elasticity,
        TemperatureInput,
        Token,
        CombatSims,
        HeatSim
    },
    name: "Helper",
    data() {
        return {
            name: "iron",
            adj: "iron",
            nameAdj: "iron",
            color: "GRAY",
            melting_exists: true,
            boiling_exists: true,
            ignition_exists: true,
            colddam_exists: true,
            heatdam_exists: true,
            maxEdge: 10000,
            matValue: 10,
            melting: 11000,
            boiling: 12000,
            heatdam: 10000,
            colddam: 10000,
            ignition: 10000,
            specHeat: 450,
            solidDensity: 5000,
            liquidDensity: 5000,
            molarMass: 55485,
            compressiveYield: 100000,
            compressiveFracture: 100000,
            shearYield: 100000,
            shearFracture: 100000,
            tensileYield: 100000,
            tensileFracture: 100000,
            elasticity: {
                bulk: 170000,
                young: 211000,
                shear: 82000,
            },
            showResult: false,
            realisticElasticity: true,
            curTab: 0,
            buttonText: "📋 Copy text",
            shouldShowAll: false
        }
    },
    computed: {
        solidName: function() {
            if (!this.melting_exists || this.melting < 10032) {
                return 'frozen ' + this.name
            } else {
                return this.name
            }
        },
        liquidName: function() {
            if (this.melting_exists && this.melting >= 10032) {
                return 'molten ' + this.name
            } else {
                return this.name
            }
        },
        gasName: function() {
            if (this.boiling_exists && this.boiling >= 10032) {
                return 'boiling ' + this.name
            } else {
                return this.name
            }
        },
        solidAdj: function() {
            if (this.melting_exists && this.melting < 10032) {
                return 'frozen ' + this.adj
            } else {
                return this.adj
            }
        },
        liquidAdj: function() {
            if (this.melting >= 10032) {
                return 'molten ' + this.adj
            } else {
                return this.adj
            }
        },
        gasAdj: function() {
            if (this.boiling >= 10032) {
                return 'boiling ' + this.adj
            } else {
                return this.adj
            }
        },
        impactYield: function() {
            return this.compressiveYield
        },
        impactFracture: function() {
            return this.compressiveFracture
        },
        impactElasticity: function() {
            return 100*this.impactYield / this.elasticity.bulk
        },
        compressiveElasticity: function() {
            return 100*this.compressiveYield / this.elasticity.bulk
        },
        tensileElasticity: function() {
            return 100*this.tensileYield / this.elasticity.young
        },
        shearElasticity: function() {
            return 100*this.shearYield / this.elasticity.shear
        },
        bendingYield: function() {
            return this.tensileYield
        },
        bendingFracture: function() {
            return this.tensileFracture
        },
        bendingElasticity: function() {
            return 100*this.bendingYield / this.elasticity.shear
        },
        showAll: function() {
            return this.shouldShowAll || this.curTab == 5
        },
        showGame: function() {
            return this.showAll || this.curTab == 0
        },
        showThermal: function() {
            return this.showAll || this.curTab == 1
        },
        showMass: function() {
            return this.showAll || this.curTab == 2
        },
        showStrength: function() {
            return this.showAll || this.curTab == 3 || this.curTab == 4
        },
        showName: function() {
            return this.showGame || this.showThermal
        },
        reasonableEdged: function() {
            return this.shearFracture > 200000
        },
        magmaSafe: function() {
            return !((this.melting_exists && this.melting < 12000) || (this.boiling_exists && this.boiling < 12000) || (this.heatdam_exists && this.heatdam < 12000) || (this.ignition_exists && this.ignition < 12000))
        },
        bluntDefense: function() {
            return this.impactFracture*2 - this.impactYield;
        },
    },
    methods: {
        copyRaw() {
            // incredibly low tech, i know
            let text = document.getElementById("result")
            window.getSelection().removeAllRanges()
            window.getSelection().selectAllChildren(text)
            document.execCommand("copy")
            window.getSelection().removeAllRanges()
            this.buttonText = "Copied!✔️"
        },
        resetCopyBtn() {
            this.buttonText = "📋 Copy text"
        }
    }
})

</script>