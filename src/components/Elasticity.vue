<template>
    <div class = "tab_content">
        <b-container>
            <b-row>
                <b-form-checkbox v-model="realisticElasticity">
                    Realistic auto-fill
                </b-form-checkbox>
                <b-button variant="info" v-b-toggle.realism-help>?</b-button>
                <b-collapse accordion="elasticity-accord" id = "realism-help">
                    All materials in Dwarf Fortress are homogenous and isotropic, and all homogonous and isotropic materials can calculate all of the below properties using any two of them. This does this automatically. Wikipedia has an ever-in-depth <b-link href="https://en.wikipedia.org/wiki/Hooke%27s_law">article on this</b-link>, with the specific table I'm using being on the <b-link href="https://en.wikipedia.org/wiki/Template:Elastic_moduli">elastic modulus template.</b-link>.
                </b-collapse>
            </b-row>
        </b-container>
        <b-input-group>
            <b-input-group-prepend>
                <b-form-radio v-if="realisticElasticity" name="anchor" v-model="anchor" squared button-variant = "outline-dark" button value='bulk'>
                    <b-icon-lock v-if="anchor=='bulk'"></b-icon-lock>
                    <b-icon-unlock v-else></b-icon-unlock>
                </b-form-radio>
            </b-input-group-prepend>
            <template #append>
                <b-button variant="info" v-b-toggle.bulk-help>Bulk</b-button>
            </template>
            <b-form-input number type="number" v-bind:value="bulk" v-on:input="update_elasticity($event,'bulk')"></b-form-input>
        </b-input-group>
            <b-collapse accordion="elasticity-accord" id="bulk-help">
                <token-info name='Bulk modulus' href = "https://en.wikipedia.org/wiki/Bulk_modulus" token="IMPACT_STRAIN_AT_YIELD">
                    <template #dwarf>
                        Used for COMPRESSIVE_STRAIN_AT_YIELD and IMPACT_STRAIN_AT_YIELD. When an attack fails to reach the momentum threshold for breaking through an attack, the momentum of the attack will still pass through, but will have its momentum divded by IMPACT_STRAIN_AT_YIELD/50000. This is very near zero for most materials; however, STRAIN_AT_YIELD is assumed 50000 for chain armor.
                    </template>
                    <template #science>
                        If you apply pressure to a sphere of material from all sides equally, the sphere will shrink; the bulk modulus is a measure of how much it shrinks, specifically how much pressure it takes to divide its radius by two. Most materials will break far before then, but this is a constant of proportionality.
                        <svg width=40 height=40>
                            <title>A circle is squashed to half of its radius.</title>
                            <circle id="bulk" cx="20" cy="20" r="20" fill="gray">
                                <animate begin="bulk.click" attributeName="r" to="10" dur="3s" fill="freeze"/>
                            </circle>
                        </svg>
                    </template>
                </token-info>
            </b-collapse>
        <b-input-group>
        <b-input-group-prepend>
            <b-form-radio v-if="realisticElasticity" name="anchor" v-model="anchor" button squared button-variant = "outline-dark" value='young'>
                <b-icon-lock v-if="anchor=='young'"></b-icon-lock>
                <b-icon-unlock v-else></b-icon-unlock>
            </b-form-radio>
        </b-input-group-prepend>
        <template #append>
            <b-button variant="info" v-b-toggle.young-help>Young's</b-button>
        </template>

        <b-form-input number type="number" v-bind:value="young" v-on:input="update_elasticity($event,'young')"></b-form-input>
        </b-input-group>
        <b-collapse accordion="elasticity-accord" id="young-help">
            <token-info name="Young's modulus" href = "https://en.wikipedia.org/wiki/Young%27s_modulus" token="TENSILE_STRAIN_AT_YIELD">
                <template #dwarf>
                    Used for TENSILE_STRAIN_AT_YIELD and BENDING_STRAIN_AT_YIELD. Neither of these are used much by the game, if at all. If they are, it's in wrestling or, more likely, in attacks transferring momentum to parent parts via bending.
                </template>
                <template #science>
                    If you pull on a rod on both sides, it'll stretch out. This is how much pressure has to be applied to stretch it so that it's at twice the length. Again, most materials will break well before this, and it's a constant of proportionality.
                    <svg width=100 height=30>
                        <title>A rectangle, twice as wide as it is long, is stretched to be four times as wide as it is long when clicked.</title>
                        <polygon id="youngs" points="25,0 25,25 75,25 75,0" fill="gray">
                            <animate begin="youngs.click" attributeName="points" to="0,0 0,25 100,25 100,0" dur="3s" fill="freeze"/>
                        </polygon>
                    </svg>
                </template>
            </token-info>
        </b-collapse>
        <b-input-group>
            <b-input-group-prepend>
                <b-form-radio v-if="realisticElasticity" name="anchor" v-model="anchor" button squared button-variant = "outline-dark" value='shear'>
                        <b-icon-lock v-if="anchor=='shear'"></b-icon-lock>
                        <b-icon-unlock v-else></b-icon-unlock>
                </b-form-radio>
                </b-input-group-prepend>
            <b-form-input number type="number" v-bind:value="shear" v-on:input="update_elasticity($event,'shear')"></b-form-input>
            <template #append>
                <b-button variant="info" v-b-toggle.shear-help>Shear</b-button>
            </template>
            </b-input-group>
        <b-collapse accordion="elasticity-accord" id="shear-help">
            <token-info name="Shear modulus" href = "https://en.wikipedia.org/wiki/Shear_modulus" token="SHEAR_STRAIN_AT_YIELD">
                <template #dwarf>
                    Used for SHEAR_STRAIN_AT_YIELD and TORSION_STRAIN_AT_YIELD. Used like IMPACT_STRAIN_AT_YIELD (bulk modulus), but for failed edged attacks instead.
                </template>
                <template #science>
                    If you affix a cube to the ground and press on the top, the bottom will stay the same while the top will move. The shear modulus is how much pressure has to be applied to... uh, just click this.
                    <svg width=100 height=50>
                        <title>Take a rectangle with points ABCD, top left then clockwise. The rectangle is skewed--sheared--so that it's a parallelogram, with diagonal AC now a vertical line.</title>
                        <polygon id="shear" points="0,0 0,50 50,50 50,0" fill="gray">
                            <animate begin="shear.click" attributeName="points" to="50,0 0,50 50,50 100,0" dur="3s" fill="freeze"/>
                        </polygon>
                    </svg>
                    This is how much pressure it takes to deform a cube <i>exactly</i> like this, when viewed face-on.
                </template>
            </token-info>
        </b-collapse>
        <div v-if="realisticElasticity">
            <b-input-group>
            <b-input-group-prepend>
                <b-form-radio v-if="realisticElasticity" name="anchor" v-model="anchor" button squared button-variant = "outline-dark" value='lamé'>
                        <b-icon-lock v-if="anchor=='lamé'"></b-icon-lock>
                        <b-icon-unlock v-else></b-icon-unlock>
                </b-form-radio>
            </b-input-group-prepend>
            <b-form-input number type="number" v-bind:value="lamé" v-on:input="update_elasticity($event,'lamé')"></b-form-input>
            <template #append>
                <b-button variant="info" v-b-toggle.lamé-help>λ</b-button>
            </template>
            </b-input-group>
            <b-collapse accordion="elasticity-accord" id="lamé-help">
            <b-card>
                <b-card-title>
                    <b-button block variant="primary" href="https://en.wikipedia.org/wiki/Lam%C3%A9_parameters">Wikipedia</b-button>
                </b-card-title>
                    <b>Lamé's first parameter</b>, or <b>λ</b>, is one of the parameters relating stress to strain in materials in 3D space. This is, of course, true of <b>all</b> of the parameters in this tab, but Lamé's is interesting for being a lot more difficult to describe its physical consequences. Obviously it has some; one can describe all of an isomorphic homogenous material's elastic properties using nothing but λ and any of these other ones. <a href=https://agilescientific.com/blog/2012/9/26/l-is-for-lambda.html>Here's a post on it, I guess.</a> It's mostly here for convenience sake: there is a small chance a material will have only λ and one other parameter (probably the shear modulus, Lamé's second). This is also why we add Poisson's ratio, below.
                </b-card>
            </b-collapse>
            <b-input-group>
            <b-input-group-prepend>
                <b-form-radio v-if="realisticElasticity" name="anchor" v-model="anchor" squared button-variant = "outline-dark" button value='poisson'>
                    <b-icon-lock v-if="anchor=='poisson'"></b-icon-lock>
                    <b-icon-unlock v-else></b-icon-unlock>
                </b-form-radio>
            </b-input-group-prepend>
            <b-form-input lazy id="poisson" step="0.05" max="0.499" min="-0.999" type="number" number :state = "poisson_state" v-bind:value="poisson" v-on:input="update_elasticity($event,'poisson')"></b-form-input>
            <b-form-invalid-feedback id="poisson-feedback">
                Poisson ratio can only be between -1 and 0.5, otherwise you get negative elastic moduli.
            </b-form-invalid-feedback>
            <template #append>
                <b-button variant="info" v-b-toggle.poisson-help>ν</b-button>
            </template>
            </b-input-group>
            <b-collapse accordion="elasticity-accord" id="poisson-help">
                <b-card>
                    <b-card-title>
                        <b-button block variant="primary" href="https://en.wikipedia.org/wiki/Poisson%27s_ratio">Wikipedia</b-button>
                    </b-card-title>
                    <p><b>Poisson's ratio</b> is the ratio of deformation in directions perpendicular to load to the deformation in the same direction. For example, a poisson ratio of 0.3 means that if you squeeze an object made of this material from the top hard enough to reduce its length in that direction to 50%, its width will <i>increase</i> by 15%. This is the default lock because more than any other value here, one could consider it a proportionality constant between <i>other elasticity moduli</i>. This is aided by the fact that it's constrained: values outside the range -1 to 0.5 exclusive cause singularities or 0 or negative elasticity, which is physical nonsense.</p>

                    <p>Typically, metals usually have a poisson ratio around 0.3. Poisson ratios of less than 0 are very rare excepting certain metamaterials, often designed specifically to have this property. A material like rubber, with a poisson ratio very close to 0.5, is easy to stretch but hard to compress. A poisson ratio of 0 has the shear modulus precisely 1/2 of young's modulus and bulk modulus precisely 1/3 of young's.</p>
                </b-card>
            </b-collapse>
            <p>I recommend you keep poisson ratio on lock unless you only know two material properties anyway. For example, if you only know shear modulus and bulk modulus, you should input one or the other, lock the one you just input, then input the other one; the rest will fill out accordingly.</p>
            <b-button variant="info" v-b-toggle.graph>Graph helper</b-button>
            <b-collapse id="graph">
            <p>This asks for your name. <b>Please do not use your real name. I will have access to it. Just put nonsense in or whatever.</b></p>
            <b-embed
                type="iframe"
                aspect='4by3'
                src="https://student.desmos.com/join/52gpfc"
            ></b-embed>
            </b-collapse>
        </div>
    </div>
</template>

<script>
import {BIconLock, BIconUnlock} from 'bootstrap-vue'

import TokenInfo from "@/components/TokenInfo.vue"

export default {
    props: {
        elasticity: Object
    },
    components: {
        BIconLock,
        BIconUnlock,
        TokenInfo
    },
    data: function() {
        return {
            bulk: 170000,
            young: 211000,
            shear: 82000,
            lamé: 115000,
            poisson: 0.293,
            realisticElasticity: false,
            anchor: "poisson"
        }
    },
    model: {
        prop: 'elasticity',
        event: 'update:elasticity'
    },
    methods: {
        getSigFig(num) {
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
        },
        sigFigs(n, sig) { //http://blog.magnetiq.com/post/497605344/rounding-to-a-certain-significant-figures-in
            var mult = Math.pow(10,
                sig - Math.floor(Math.log(n) / Math.LN10) - 1);
            return Math.round(n * mult) / mult;
        },
        getSigFigs(nums) {
            var m = -Infinity
            for(const x of nums) {
                m = Math.max(this.getSigFig(x),m)
            }
            return m
        },
        parameterize(anchors) {
            if(this.realisticElasticity) {
                var no = function(str) {
                    return anchors.indexOf(str) == -1
                }
                if(no("poisson")) {
                    if(no("young")) {
                        if(no("bulk")) {
                            const sig = Math.max(this.getSigFigs([this.lamé, this.shear]),3)
                            this.bulk = this.sigFigs(this.lamé + ((2 * this.shear) / 3),sig)
                            anchors += "bulk"
                        }
                        const K = this.bulk
                        const G = this.shear
                        const sig = Math.max(this.getSigFigs([K, G]),3)
                        this.young = this.sigFigs((9*K*G)/(3*K+G),sig)
                        anchors += "young"
                    }
                    const sig = Math.max(this.getSigFigs([this.young, this.shear]),3)
                    this.poisson = this.sigFigs((this.young / (2*this.shear)) - 1, sig)
                    anchors += "poisson"
                }
                if(no("young")) {
                    const c = 1-2*this.poisson;
                    if(no("bulk")) {
                        if(no("shear")) {
                            const sig = Math.max(this.getSigFigs([this.lamé, this.poisson]), 3)
                            const v = this.poisson;
                            const l = this.lamé;
                            this.shear = this.sigFigs((l*c)/(2*v),sig)
                            anchors += "shear"
                        }
                        const sig = Math.max(this.getSigFigs([this.poisson, this.shear]),3)
                        this.bulk = this.sigFigs((2*this.shear*(1+this.poisson))/(3*c),sig)
                        anchors += "bulk"
                    }
                    const K = this.bulk
                    const v = this.poisson
                    const sig = Math.max(this.getSigFigs([K, v]),3)
                    this.young = this.sigFigs(3*K*c,sig)
                    anchors += "young"
                }
                const v = this.poisson;
                const E = this.young;
                const sig = Math.max(this.getSigFigs([v,E]),3)
                if(no("bulk")) {
                    this.bulk = this.sigFigs(E/(3*(1-2*v)),sig)
                }
                if(no("shear")) {
                    this.shear = this.sigFigs(E/(2*(1+v)),sig)
                }
                if(no("lamé")) {
                    this.lamé = this.sigFigs((E*v)/((1+v)*(1-2*v)),sig)
                }
            }
            this.$emit("update:elasticity",{bulk: this.bulk, young:this.young, shear:this.shear})
        },
        update_elasticity(event, which) {
            if(!event)
                event = 0
            this[which] = Number(event)
            this.parameterize([which, this.anchor])
        },
    },
    computed: {
        poisson_state() {
            return (this.poisson > -1 && this.poisson < 0.5) ? null : false
        }
    }

}
</script>
