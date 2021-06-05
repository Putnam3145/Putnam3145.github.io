<template>
<div>
<b-container fluid>
    <b-row>
    <b-col cols=8>
    <b-tabs v-model = "curTab" pills vertical card>
    <b-tab title = "Game">
    <div class="input_category tab_content" style="grid-template-rows: repeat(2,min-content);">
        <token v-model = "name" token="STATE_NAME" description="The material's noun." placeholder="iron">
            Like "piles of {{name}}". If this is the same as ADJ, it'll automatically use STATE_NAME_ADJ instead.
        </token>
        <token v-model = "adj" token="STATE_ADJ" description="The material's adjective." placeholder="iron">
            Like "{{adj}} long sword". If this is the same as NAME, it'll automatically use STATE_NAME_ADJ instead.
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
        </b-row>
        <b-row>
        <token type = "number" number v-model.number = "specHeat" token = "SPEC_HEAT" description = "The specific heat capacity, in J/kg-K." placeholder="450" href="https://en.wikipedia.org/wiki/Specific_heat_capacity" name="Specific heat capacity" complex>
            <template #dwarf>
                Temperature is stored as a fixed-point number and this is the denominator of the fractional part. In other words, the "minimum temperature unit" of a material is 1/SPEC_HEAT. When an object of one temperature interfaces with another, the whole parts of the temperatures are compared, A-B, and then each material's "minimum temperature unit" is incremented by this value. Below is a simulator for this process: it uses the same process (with floats instead of fixed-points, mind) and works as fast as Dwarf Fortress's default speed.
                <heat-sim :specHeat = specHeat></heat-sim>
            </template>
            <template #science>
                This is how much heat it takes to increase a kilogram of material by one kelvin. The most familiar example is water, whose value in DF's units is 4184. The calorie is a unit of energy based on water's heat capacity, so don't get confused about that. Water's heat capacity is 1 calorie/gram-kelvin, or 1000 calories/kilogram-kelvin, or 4184 Joules/kilogram-kelvin. 
            </template>
        </token>
        </b-row>
    </b-container>
    </b-tab>
    <b-tab title="Mass">
    <div class = "tab_content input_category">
        <b-form-row>
        <token type = "number" number v-model.number = "solidDensity" token = "SOLID_DENSITY" description = "The density of the material when solid, in kilograms/meter^3." placeholder = "7850">
            This is actually one of the more important stats, for blunt weapons, ammo and, surprisingly, armor. Armor of sufficient density can stop low-momentum attacks cold. For ammo, there's a max velocity weapons can fire at and a max force, so there's a maximum density that matters. For crossbows, this is 1666, which is hilariously low, only mattering for wood ammunition and adamantine, which is so sharp and strong it doesn't even matter.
        </token>
        <token type = "number" number v-model.number = "liquidDensity" token = "LIQUID_DENSITY" description = "The density of the material when liquid." placeholder="6980">
            This only matters for hauling.
        </token>
        </b-form-row>
        <token type = "number" number v-model.number = "molarMass" token = "MOLAR_MASS" description = "The molar mass of this material, in kilograms/mol." placeholder = "55485" complex href="https://en.wikipedia.org/wiki/Molar_mass" name="Molar mass">
            <template #dwarf>
                Last I checked, even Toady seems somewhat baffled as to the provenance of this token. It's mostly only important for computational fluid dynamics--the specific gas constant is <katex-element expression="\frac{R}{M}" />, where R is the <b-link href="https://en.wikipedia.org/wiki/Gas_constant">gas constant</b-link> and M is the molar mass, and this is important for, say, force calculations for moving air, but Dwarf Fortress just doesn't have any of that.
            </template>
            <template #science>
                This is simply the mass of a mole of material. This is important not only in computational fluid dynamics, but in chemistry--you probably want to measure your reagents by moles rather than by mass for stoichiometry purposes. Of course, all reactions in DF are custom-coded in the raws, and this is unlikely to change any time soon (although it is possible it will change eventually).
            </template>
        </token>
    </div>
    </b-tab>
    <b-tab title="Strength">
    <b-container>
        <b-row>
            <b-button-group>
            <b-button @click="strengthPlaceholders" variant="primary">Use standard DF placeholders</b-button>
            <b-button @click="realisticPlaceholders" variant="primary">Use engineering placeholders</b-button>
            <b-button variant="info" v-b-toggle.strengthPlaceholder>?</b-button>
            </b-button-group>
            <b-collapse id="strengthPlaceholder">
                <p>The former just sets shear yield to tensile yield, compressive yield to 3.5x shear yield and fractures to double yield.</p>
                <p>The latter instead sets shear yield to <katex-element expression="\sqrt{\frac{1}{3}}"/> tensile yield, but does the rest the same, <b-link href="https://en.wikipedia.org/wiki/Shear_strength#Comparison">as engineers apparently do sometimes.</b-link></p>
            </b-collapse>
        </b-row>
        <b-form-row>
        <token type = "number" number v-model.number = "tensileYield" token = "TENSILE_YIELD" description = "The tension at which this material no longer bounces back when stretched." complex name="Tensile yield strength" href = "https://en.wikipedia.org/wiki/Yield_(engineering)" placeholder="155000">
            <template #dwarf>
                Only matters for latched-on edged creature attacks--so, bites. Higher is better.
            </template>
            <template #science>
                This is the pressure above which a material being pulled on from both sides won't go back to its original length when the pulling stops. It's often of much greater import than treated in DF.
            </template>
        </token>
        <token type = "number" number v-model.number = "tensileFracture" token = "TENSILE_FRACTURE" description = "The tension at which this material will tear when stretched." placeholder = "310000" complex name="Tensile strength" href="https://en.wikipedia.org/wiki/Ultimate_tensile_strength">
            <template #dwarf>
                Basically the same as TENSILE_YIELD, though probably more important in its (pretty small) niche.
            </template>
            <template #science>
            This represents the pressure at which a material breaks when pulled on. This is actually usually treated as incredibly important in engineering--this is often called "ultimate strength" in real life, even omitting the "tensile" part. There's even an important derived quantity, "specific strength", which <katex-element expression="\frac{T_s}{\rho}" />, where <katex-element expression="T_s" /> is ultimate tensile strength and <katex-element expression="\rho" /> is density. For your material, that's {{ Math.round(tensileFracture / (solidDensity / 1000)) / 1000}} <katex-element expression="\frac{kN \cdot m}{kg}"/>; compare to steel's 91.72, or adamantine's 25,000 (!), or graphene's <citation text="62,453." id="graphene"><b-link href="https://en.wikipedia.org/wiki/Specific_strength">Wikipedia, "Specific Strength"</b-link>; cited from <b-link href="https://web.archive.org/web/20140328060419/https://www.nobelprize.org/nobel_prizes/physics/laureates/2010/advanced-physicsprize2010.pdf">the Royal Swedish Academy of Sciences article on the 2010 Nobel laureates,</b-link>, which has a section on graphene's strength from which the value was (hopefully) derived via dimensional analysis.</citation>
            </template>
        </token>
        </b-form-row>
        <b-form-row>
        <token type = "number" number v-model.number = "shearYield" token = "SHEAR_YIELD" description = "The stress at which this material no longer bounces back when sheared." placeholder="155000" complex name = "Shear yield strength" href="https://en.wikipedia.org/wiki/Shear_strength">
            <template #dwarf>
                Technically involved in edged attacks, but since SHEAR_FRACTURE is multiplied by the contact area (which is 5 at the very least) in combat calculations, it doesn't matter except for bolts, and even then only barely. If you mod in ammo or attacks that have a size of 1, this will matter, otherwise not so much. This is also copied to TORSION_YIELD, which is like TENSILE but for blunt attacks that latch... which vanilla DF has none of.
            </template>
            <template #science>
                This is the <i>twisting</i> pressure at which a material won't untwist. This can also be derived via <b-link href="https://en.wikipedia.org/wiki/Von_Mises_yield_criterion">some math</b-link>, but I think this requires more information than I take here.
            </template>
        </token>
        <token type = "number" number v-model.number = "shearFracture" token = "SHEAR_FRACTURE" description = "The stress at which this material will break when sheared." placeholder = "310000" complex name = "Shear strength" href="https://en.wikipedia.org/wiki/Shear_strength">
            <template #dwarf>
            This is, for all intents and purposes, the <i>only</i> stat that matters in defense against bladed weapons. Technically a bladed attack failure becomes a blunt attack, so all those stats matter too, but for bladed defense, nothing else matters as much as this, even remotely. On bladed offense, MAX_EDGE is a close second.
            </template>
            <template #science>
                This one isn't nearly as important as tensile strength, at least in common use in engineering. Apparently it's often just estimated as 60% of tensile strength, assumedly due to the <b-link href="https://en.wikipedia.org/wiki/Von_Mises_yield_criterion">von Mises yield criterion</b-link> as well as the fact that, according to engineers, <katex-element expression="\sqrt{\frac{1}{3}} = 0.6" /> Dwarf Fortress estimates it as 100% of tensile strength, which is a bit more than that. 
            </template>
        </token>
        </b-form-row>
        <b-form-row>
        <token type = "number" number v-model.number = "compressiveYield" token = "COMPRESSIVE_YIELD" description = "The pressure at which this material no longer bounces back when compressed." placeholder = "542500" complex name="Compressive yield strength" href="https://en.wikipedia.org/wiki/Compressive_strength">
            <template #dwarf>
                This only matters for pinching and strangulation. However, it's copied to IMPACT_YIELD, which matters quite a lot: a material with a low IMPACT_YIELD can be completely deflected by armor with high density (imagine a semi-solid material going <i>splat</i> against a wall). Interestingly enough, though, a high impact yield actually makes armor <i>worse</i>--the material coefficient in blunt armor calculations is equal to 2*IMPACT_FRACTURE - IMPACT_YIELD--for this material, {{2*compressiveFracture - compressiveYield}}. I would assume this is to represent the fact that a low IMPACT_FRACTURE allows armor to "absorb impact" more--any denting is energy dissipated into the armor, rather than into your squishy, squishy body.
            </template>
            <template #science>
                This one's an odd one. There's a real-life notion of compressive strength, important in engineering... but whether that means yield or fracture strength is dependent on context. The game uses approximations of 3.5x tensile strength, because, for the most part, there's really no data on this. This is probably more of a Dwarf Fortress problem than a problem with reality, of course.
            </template>
        </token>
        <token type = "number" number v-model.number = "compressiveFracture" token = "COMPRESSIVE_FRACTURE" description = "The pressure at which this material will break when compressed." placeholder = "1085000">
            This is copied to impact fracture, which, along with shear fracture and to a lesser extent density and impact yield (albeit inversely) are the only properties that matter for armor, period. Everything else is related to skill, weapon and armor themselves. The higher the better, for this and shear fracture. For density, higher is better on defense, but lower-skilled armor users will have trouble wearing it without being encumbered. For reality: see compressive yield.
        </token>
        </b-form-row>
        <b-form-row>
        <token type = "number" number v-model.number = "maxEdge" token="MAX_EDGE" description="How sharp the material can get." placeholder="10000">
            This is the sharpest a weapon of this material can be. Lower-quality weapons are less sharp, so this also, to an extent, makes quality more important for weapons, though higher is <i>always</i> better.
        </token>
        </b-form-row>
    </b-container>
    </b-tab>
    <b-tab lazy title="Elasticity">
        <elasticity v-model="elasticity"></elasticity>
    </b-tab>
    <b-tab title="Facts">
        <combat-sims :name = "solidName" :solidDensity = "solidDensity"
        :impactYield = "impactYield" :impactFracture = "impactFracture"
        :shearYield = "shearYield" :shearFracture = "shearFracture"
        :maxEdge = "maxEdge">
            <b-tabs>
                <b-tab title="Interesting properties">
                    Speed of sound is <katex-element display-mode :expression="speedOfSound" /><br/>
                    Your material can be considered <span v-if="shearFracture / shearYield > 1.1 && shearElasticity > 100">ductile</span><span v-else>brittle</span>.
                </b-tab>
                <b-tab title="Stress-strain properties">
                    <p>The below is the "approximate" <b-link href="https://en.wikipedia.org/wiki/Stress–strain_curve">stress-strain curve</b-link> of your material.  Up to yield it should be reasonably accurate, after that it's just a silly flat line because, well, there's no simulation of any of the properties between yield and fracture.</p>
                    <svg width="505px" height="300px">
                        <path id="stressStrain" :d="stressStrainCurve" stroke="cyan" fill-opacity = "0" stroke-width = "3" />
                        <path d="M 100 0 V 300 H 500" fill-opacity = "0" stroke-width = "2" stroke="white"/>
                        <text :x="100 + (tensileYield / tensileFracture) * 400" y = "50" stroke = "white" fill="white">Yield</text>
                        <circle :cx="100 + (tensileYield / tensileFracture) * 400" cy = "30" r = "4" fill="white"/>
                        <text text-anchor = "middle" x="500" y="30" stroke = "white" fill="white" dy=".3em">x</text>
                        <text text-anchor = "end" x="500" y="50" stroke = "white" fill="white">Fracture</text>
                        <text text-anchor = "end" x="100" y="250" stroke = "white" fill="white">Stress (σ)</text>
                        <text text-anchor = "start" x="150" y="290" stroke = "white" transform="translate(-10 0)" fill="white"><textPath href="#stressStrain">Stress-strain curve</textPath></text>
                        <text text-anchor = "start" x = "200" y = "295" stroke = "white" fill="white">Strain (ε)</text>
                    </svg>
                    <katex-element display-mode :expression="toughness" />
                    <p>This is, of course, the integral of the above graph, using the <b-link href="https://en.wikipedia.org/wiki/Trapezoidal_rule">trapezoidal rule</b-link> to get... well, an exact value. It has no meaning whatsoever in Dwarf Fortress... or does it? There is a sense in which it might apply: blunt defense does increase with the difference between fracture and yield, just like this value does.</p>
                </b-tab>
                <b-tab title="Stiffness tensor">
                    <p>This is the material's stiffness tensor in matrix form. Since all materials in DF are kinda inherently isomorphic and homogenous, it's that particular form of it. If the game allowed other kinds of materials... well, it'd get a lot <i>weirder</i>, for one thing. A tool such as this might be entirely <i>necessary</i>, even!</p>
                    <katex-element display-mode :expression="stiffness" />
                </b-tab>
            </b-tabs>
        </combat-sims>
    </b-tab>
    <b-tab v-if="false" title = "Help">
        <p>You don't need to use the exact values given or adhere strictly to the helper's choices regarding weapons/armor/anvils and so on. This is a <i>helper</i>, not a standard.</p>
        <p>If you don't know where to start finding a material's properties, here's a few sources:<br/>
        <b-link href="http://www.matweb.com/index.aspx">Matweb</b-link><br/>
        <b-link href="http://www.wolframalpha.com/">Wolfram Alpha</b-link><br/>
        <b-link href="https://en.wikipedia.org/wiki/Main_Page">Wikipedia</b-link><br/>
        <b-link href="http://www.webelements.com/">WebElements</b-link><br/>
        <p>If any properties are unavailable, the game will use placeholders. However, if those properties happen to be strength, it would be best to estimate to the best of your ability, such as by using a similar material (E.G iron for cobalt).</p>
        <p>Some properties are outright optional, i.e. NONE is valid. For these, the helper has a toggle.</p>
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
import Citation from "@/components/Citation.vue"

function getSigFig(num) {
    if (!num) {
        return num
    }
    var trailers = 0
    if (Math.abs(num)>1) {
        var zeroes=0
        while(Math.floor(num/Math.pow(10,zeroes))==num/Math.pow(10,zeroes)) {
            zeroes++
        }
        return Math.floor(Math.log10(num))-(zeroes-2)
    }
    else {
        trailers=0
        while(Math.floor(num*Math.pow(10,trailers))!=num*Math.pow(10,trailers)) {
            trailers++
    }
    return trailers
    }
}

function sigFigs(n, sig) { //http://blog.magnetiq.com/post/497605344/rounding-to-a-certain-significant-figures-in
    var mult = Math.pow(10,
        sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
}
function getSigFigs(nums) {
    var m = -Infinity
    for(const x of nums) {
        m = Math.max(getSigFig(x),m)
    }
    return m
}

function toMatrix(arr) {
    let ret = "\\begin{bmatrix}\n"
    for(const row of arr) {
        for(const member of row) {
            ret += member + " &"
        }
        ret = ret.slice(0,-2) + "\\\\\n"
    }
    return ret.slice(0,-3) + "\n\\end{bmatrix}"
}

export default ({
    components: {
        Elasticity,
        TemperatureInput,
        Token,
        CombatSims,
        HeatSim,
        Citation
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
            return this.shouldShowAll || this.curTab >= 5
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
        speedOfSound: function() {
            return "\\sqrt{\\frac{K}{\\rho}} = " + Math.round(Math.sqrt(1000 * this.elasticity.bulk / this.solidDensity) * 100)/100 + "\\frac{\\text{meters}}{\\text{second}}"
        },
        stiffness: function() {
            const sig = getSigFigs([this.elasticity.bulk, this.elasticity.shear])
            const l = sigFigs(this.elasticity.bulk - (2*this.elasticity.shear)/3, sig) / 1000
            const p = sigFigs(l + 2*this.elasticity.shear, sig) / 1000; // p-wave modulus
            const s = this.elasticity.shear / 1000
            return toMatrix([
                [p, l, l, 0, 0, 0],
                [l, p, l, 0, 0, 0],
                [l, l, p, 0, 0, 0],
                [0, 0, 0, s, 0, 0],
                [0, 0, 0, 0, s, 0],
                [0, 0, 0, 0, 0, s]
            ]) + "\\text{GPa}" + toMatrix([
                ["\\epsilon_{11}"],
                ["\\epsilon_{22}"],
                ["\\epsilon_{33}"],
                ["2\\epsilon_{23}"],
                ["2\\epsilon_{13}"],
                ["2\\epsilon_{12}"],
            ])
        },
        toughness: function() {
            let s = "\\int_{0}^{\\epsilon_f}\\sigma d\\epsilon ="
            const elasticCurve = (this.tensileYield * this.tensileElasticity / 200000)
            const justPretendFlatOkay = (this.tensileFracture - this.tensileYield) * (this.tensileElasticity / 100000);
            s += Math.round((elasticCurve+justPretendFlatOkay) * 1000) + "\\frac{\\text{joules}}{\\text{meter}^3}"
            return s;
        },
        stressStrainCurve: function() {
            const stop = 100 + Math.round((this.tensileYield / this.tensileFracture) * 400)
            return "M 100 300 L " + stop + " 30 500 30"
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
        },
        strengthPlaceholders() {
            const y = this.tensileYield
            const f = y*2
            this.tensileFracture = f
            this.shearYield = y
            this.shearFracture = f
            this.compressiveYield = y*3.5
            this.compressiveFracture = f*3.5
        },
        realisticPlaceholders() {
            const y = this.tensileYield
            const f = y*2
            const sr3 = Math.sqrt(1/3)
            this.tensileFracture = f
            this.shearYield = sr3*y
            this.shearFracture = sr3*f
            this.compressiveYield = y*3.5
            this.compressiveFracture = f*3.5
        }
    }
})

</script>