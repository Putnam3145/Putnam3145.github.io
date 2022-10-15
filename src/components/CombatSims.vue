<template>
<b-tabs>
        <b-tabs pills card>
            <b-tab lazy title="Matchups">
                <b-button variant="success" @click="makeTable">Generate matchup chart!</b-button>
                <b-collapse :visible = "initialized">
                <p>These matchup charts show how well the material does against another.  It's standard matchup chart fare: 10 means it wins every time, 0 means it never wins. You'll have to regenerate it with the button above every time you change the properties; the calculations just take too long to happen every time you change a number.</p>
                <p>Matchup chart of attacks vs plate armor <b-button variant="info" v-b-toggle.caveat>?</b-button></p>
                <b-collapse id = "caveat"><b-card><b-card-text>Muscle numbers are going to be off because it's actually testing against a breastplate and a helmet. Solid-muscle plate armor. Very silly.</b-card-text></b-card></b-collapse>
                <b-table id="attacks-table" :items = "attacks" filter = "" :busy = "calculating" ></b-table>
                <p>Matchup chart of plate armor defense</p>
                <b-table id="defense-table" :items = "defense" filter = "" :busy = "calculating" ></b-table>
                <b-button variant="info" v-b-toggle.technical>Technical stuff/method</b-button>
                <b-collapse id = "technical">
                    <b-card>
                        <b-card-text>
                            The actual simulation is a monte carlo simulation implemented in Rust, using WebAssembly. Simply put: it tests: 
                            <b-container><b-row><b-col>4 breastplates<br/>4 -breastplates-<br/>3 +breastplates+<br/>2 *breastplates*<br/>2 ≡breastplates≡<br/>2 ☼breastplates☼<br/>1 artifact breastplate</b-col>against each individual attack you see above, multiplied by<b-col>3 weapons<br/>2 -weapons-<br/>2 +weapons+<br/>2 *weapons*<br/>2 ≡weapons≡<br/>2 ☼weapons☼.</b-col></b-row></b-container> It then does the same for helmets and greaves, for each material you see. This gives us a total of {{18*12*3*4*6*2}} trials. Each individual trial is between two dwarves of random body size and strength, using the very same algorithm as Dwarf Fortress does for the randomness as well as determining whether the attack "wins". The attack is assumed square, and no attack modifiers are taken into account. If you're interested, <b-link href="https://github.com/Putnam3145/putnam3145-github-io-wasm/blob/master/src/lib.rs">the Rust code is here.</b-link>
                            <p>Here's how the calculation works. First, we calculate the momentum like so:</p>
                            <katex-element display-mode expression = "M = \frac{\text{base size} \cdot \text{strength} \cdot \text{attack velocity}}{\frac{10^{6}(1+size)}{W}}"/>
                            <p>"Attack velocity" here refers to the last number in an ATTACK token's definition.</p>
                            <p>Now, we need to establish some terms. <katex-element expression = "a_{foo}"/> is a material property of the armor, <katex-element expression = "W_{foo}"/> is a material property of the weapon. <katex-element expression = "(M)_{x(y|f)}"/> is yield or fracture of material <katex-element expression = "M"/>; for example, <katex-element expression = "M_{sy}"/> is the shear yield.</p> 
                            <p>Then, we check against blades, if the attack is edged:</p>
                            <katex-element display-mode expression = "M \ge \frac{a_{sy}}{W_{sy}} + A\frac{a_{sf}}{W_{sf}}\frac{10+2Q_a}{Q_wW_e}" />
                            <p>Where <katex-element expression = "Q_a"/> is the armor quality coefficient, <katex-element expression = "Q_w"/> is weapon sharpness quality coefficient, <katex-element expression = "W_e"/> is the max edge of the weapon divided by 10,000 and <katex-element expression = "A"/> is the contact area of the attack, which is the layer size or the attack's actual contact area, whichever is smaller. <b-link href="https://dwarffortresswiki.org/index.php/DF2014:Item_quality#Quality_grades">See here for quality grades.</b-link></p>
                            <p>If that gets through, the following is then checked:</p>
                            <katex-element display-mode expression = "\frac{2W_sW_{iy}}{1000} \ge Aa_\rho" />
                            <p>Where <katex-element expression = "W_s"/> is the weapon's physical size (e.g. 800 for maces) and <katex-element expression = "M_\rho"/> is material M's density.</p>
                            <p>If this fails, the attack is stopped short. If it succeeds, we move on to this:</p>
                            <katex-element display-mode expression = "M \ge (\frac{2a_{if}}{10^6}-\frac{a_{iy}}{10^6})(2+0.4Q_a)A" />
                            <p>And if that succeeds, the attack has won.</p>
                            <p>All these equations came from <b-link href="https://dwarffortresswiki.org/index.php/DF2014:Material_science">the Dwarf Fortress wiki article on material science</b-link> as well as <b-link href="http://www.bay12forums.com/smf/index.php?topic=142372.msg5767755#msg5767755">this combat calculator.</b-link></p>
                        </b-card-text>
                    </b-card>
                </b-collapse>
                </b-collapse>
            </b-tab>
            <b-tab lazy title="Values">
                <b-table id="values-table" :items = "values" filter = ""></b-table>
            </b-tab>
            <b-tab title="Misc.">
                <slot></slot>
            </b-tab>
        </b-tabs>
</b-tabs>
</template>

<script>
let wasm = import('@/wasm/pkg/putnam_github_io_bg')
var Material = function(name, solidDensity, impactYield, impactFracture, impactStrainAtYield, shearYield, shearFracture, shearStrainAtYield, maxEdge, armor) {
    return {
        name: name,
        solidDensity: solidDensity,
        impactYield: impactYield,
        impactFracture: impactFracture,
        impactStrainAtYield: impactStrainAtYield,
        shearYield: shearYield,
        shearFracture: shearFracture,
        shearStrainAtYield: shearStrainAtYield,
        maxEdge: maxEdge,
        armor: armor
    }
}

var Weapon = function(name, size, attacks) {
    return {
        name: name,
        size: size,
        attacks: attacks
    }
}

var Attack = function(name, edged, velocity, area) {
    return {
        name: name,
        edged: edged,
        velocity: velocity,
        area: area
    }
}

const weapons = [
    new Weapon("mace", 800, [new Attack(
                "bash",
                false,
                2,
                20,
            )
        ]
    ),
    new Weapon("short sword", 300, [
            new Attack(
                "slash",
                true,
                1.25,
                20000,
            ),
            new Attack(
                "stab",
                true,
                1,
                50,
            )
        ]
    ),
    new Weapon("spear", 400, [
            new Attack(
                "stab",
                true,
                1,
                20
            )
        ]
    )
]

const materials = [
    new Material("muscle", 1060, 10000, 10000, 50000, 20000, 20000, 50000, 0, true),
    new Material("iron", 7850, 542500, 1085000, 319, 155000, 310000, 189, 10000, true),
    new Material("copper", 8930, 245000, 770000, 175, 70000, 220000, 145, 10000, true),
    new Material("bronze", 8250, 602000, 843500, 547, 172000, 241000, 156, 10000, true),
    new Material("silver", 10490, 350000, 595000, 350, 100000, 170000, 333, 10000, false),
    new Material("steel", 7850, 1505000, 2520000, 940, 430000, 720000, 215, 10000, true),
    new Material("adamantine", 200, 5000000, 5000000, 0, 5000000, 5000000, 0, 100000, true),
]

function sanitize(n) {
    return typeof(n) == "number" ? n : 0
}

export default {
    name: "CombatSims",
    data() {
        return {
            attacks: [{attack_stuff: "Not loaded yet!"}],
            defense: [{defense_stuff: "Not loaded yet!"}],
            calculating: false,
            initialized: false,
        }
    },
    props: {
        name: String, solidDensity: Number, 
        impactYield: Number, impactFracture: Number, impactElasticity: Number,
        shearYield: Number, shearFracture: Number, shearElasticity: Number,
        maxEdge: Number},
    computed: {
        mat() {
            return new Material(this.name, sanitize(this.solidDensity), 
            sanitize(this.impactYield), sanitize(this.impactFracture), sanitize(this.impactElasticity),
            sanitize(this.shearYield), sanitize(this.shearFracture), sanitize(this.shearElasticity),
            sanitize(this.maxEdge), true)
        },
    },
    watch: {
        $props: {
            handler() {
                this.$root.$emit('bv::refresh::table', 'attacks-table')
                this.$root.$emit('bv::refresh::table', 'defense-table')
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        makeTable() {
            let mat = this.mat
            this.attacks = []
            this.defense = []
            this.calculating = true
            this.initialized = true
            wasm.then(m => {
            let entries = {}
            for(const weapon of weapons) {
                for(const other_mat of materials) {
                    for(const attack of weapon.attacks) {
                        const attack_name = weapon.name + " " + attack.name
                        const score = 10.0 - m.attack_score(attack, other_mat, mat, weapon)
                        entries[attack_name] = entries[attack_name] || {attack: attack_name, _cellVariants: {}}
                        entries[attack_name][other_mat.name] = score
                        if (score >= 8.0) {
                            entries[attack_name]._cellVariants[other_mat.name] = "success" 
                        } else if (score < 2.0) {
                            entries[attack_name]._cellVariants[other_mat.name] = "danger"
                        }
                    }
                }
            }
            for(const key in entries) {
                this.defense.push(entries[key])
            }
            for(const weapon of weapons) {
                for(const attack of weapon.attacks) {
                    let this_entry = {attack: weapon.name + " " + attack.name, _cellVariants: {}}
                    for(const other_mat of materials) {
                        if(!other_mat.armor) continue
                        const score = m.attack_score(attack, mat, other_mat, weapon)
                        this_entry[other_mat.name] = score
                        if (score >= 7.0) {
                            this_entry._cellVariants[other_mat.name] = "success" 
                        } else if (score < 3.0) {
                            this_entry._cellVariants[other_mat.name] = "danger"
                        }
                    }
                    this.attacks.push(this_entry)
                }
            }
            this.calculating = false
            })
            return null
        },
        values() {
            let entries = []
            entries.push({
                name: this.mat.name,
                density: this.mat.solidDensity/1000,
                impact_yield: this.mat.impactYield/1000000,
                blunt_defense: 2*(this.mat.impactFracture/1000000)-(this.mat.impactYield/1000000),
                edge_defense: this.mat.shearFracture/1000000,
                edge_attack: this.mat.shearFracture/1000000 * this.mat.maxEdge / 10000,
                average_mace_momentum: Math.round(1250*2/(1000000/60000 + this.mat.solidDensity*0.0008))
            })
            for(const mat of materials) {
                entries.push({
                    name: mat.name,
                    density: mat.solidDensity/1000,
                    impact_yield: mat.impactYield/1000000,
                    blunt_defense: 2*(mat.impactFracture/1000000)-(mat.impactYield/1000000),
                    edge_defense: mat.shearFracture/1000000,
                    edge_attack: mat.shearFracture/1000000 * mat.maxEdge / 10000,
                    average_mace_momentum: Math.round(1250*2/(1000000/60000 + mat.solidDensity*0.0008))
                })
            }
            return entries;
        },
    }
}
</script>