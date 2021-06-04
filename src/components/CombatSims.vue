<template>
<b-tabs>
        <b-tabs pills card>
            <b-tab lazy title="Matchups">
                <p>Here we have a bunch of matchup charts, how well the material does against another.  It's standard matchup chart fare: 10 means it wins every time, 0 means it never wins.</p>
                <p>Matchup chart of attacks vs plate armor <b-button variant="info" v-b-toggle.caveat>?</b-button></p>
                <b-collapse id = "caveat"><b-card><b-card-text>Muscle numbers are going to be off because it's actually testing against a breastplate and a helmet. Solid-muscle plate armor. Very silly.</b-card-text></b-card></b-collapse>
                <b-table id="attacks-table" :items = "attacks" filter = ""></b-table>
                <p>Matchup chart of plate armor defense</p>
                <b-table id="defense-table" :items = "defense" filter = ""></b-table>
                <b-button variant="info" v-b-toggle.technical>Technical stuff/method</b-button>
                <b-collapse id = "technical">
                    <b-card>
                        <b-card-text>
                            The actual simulation is a monte carlo simulation implemented in Rust, using WebAssembly. Simply put: it tests: 
                            <b-container><b-row><b-col>4 breastplates<br/>4 -breastplates-<br/>3 +breastplates+<br/>2 *breastplates*<br/>2 ≡breastplates≡<br/>2 ☼breastplates☼<br/>1 artifact breastplate</b-col>against each individual attack you see above, multiplied by<b-col>3 weapons<br/>2 -weapons-<br/>2 +weapons+<br/>2 *weapons*<br/>2 ≡weapons≡<br/>2 ☼weapons☼.</b-col></b-row></b-container> It then does the same for helmets, For each material you see. This gives us a total of {{6*4*(4+4+3+2+2+2+1)*(3+2+2+2+2+2)*2*2}} trials. Each individual trial is between two dwarves of random body size and strength, using the very same algorithm as Dwarf Fortress does for the randomness as well as determining whether the attack "wins". The attack is assumed square, and no attack modifiers are taken into account. If you're interested, <b-link href="https://github.com/Putnam3145/putnam3145-github-io-wasm/blob/master/src/lib.rs">the Rust code is here.</b-link>
                        </b-card-text>
                    </b-card>
                </b-collapse>
            </b-tab>
            <b-tab lazy title="Values">
                <b-table id="values-table" :items = "values" filter = ""></b-table>
            </b-tab>
        </b-tabs>
</b-tabs>
</template>

<script>
let wasm = import('@/wasm/putnam_github_io_bg')
var Material = function(name, solidDensity, impactYield, impactFracture, shearYield, shearFracture, maxEdge, armor) {
    return {
        name: name,
        solidDensity: solidDensity,
        impactYield: impactYield,
        impactFracture: impactFracture,
        shearYield: shearYield,
        shearFracture: shearFracture,
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
    new Material("muscle", 1060, 10000, 10000, 20000, 20000, 0, true),
    new Material("iron", 7850, 542500, 1085000, 155000, 310000, 10000, true),
    new Material("copper", 8930, 245000, 770000, 70000, 220000, 10000, true),
    new Material("bronze", 8250, 602000, 843500, 172000, 241000, 10000, true),
    new Material("silver", 10490, 350000, 595000, 100000, 170000, 10000, false),
    new Material("steel", 7850, 1505000, 2520000, 430000, 720000, 10000, true),
    new Material("adamantine", 200, 5000000, 5000000, 5000000, 5000000, 100000, true),
]

function sanitize(n) {
    return typeof(n) == "number" ? n : 0
}

export default {
    name: "CombatSims",
    props: {
        name: String, solidDensity: Number, 
        impactYield: Number, impactFracture: Number,
        shearYield: Number, shearFracture: Number,
        maxEdge: Number},
    computed: {
        mat() {
            return new Material(name, sanitize(this.solidDensity), 
            sanitize(this.impactYield), sanitize(this.impactFracture), 
            sanitize(this.shearYield), sanitize(this.shearFracture), 
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
        attacks(ctx, callback) {
            let mat = this.mat
            wasm.then(m => {
            let t = []
            for(const weapon of weapons) {
                const weapon_weight = mat.solidDensity * weapon.size / 1000000
                for(const attack of weapon.attacks) {
                    let this_entry = {attack: weapon.name + " " + attack.name, _cellVariants: {}}
                    for(const other_mat of materials) {
                        if(!other_mat.armor) continue
                        const score = m.attack_score(attack, mat, other_mat, weapon, weapon_weight)
                        this_entry[other_mat.name] = score
                        if (score >= 7.0) {
                            this_entry._cellVariants[other_mat.name] = "success" 
                        } else if (score < 3.0) {
                            this_entry._cellVariants[other_mat.name] = "danger"
                        }
                    }
                    t.push(this_entry)
                }
            }
            callback(t);
            })
            return null
        },
        defense(ctx, callback) {
            let mat = this.mat
            wasm.then(m => {
            let entries = {}
            for(const weapon of weapons) {
                for(const other_mat of materials) {
                    const weapon_weight = other_mat.solidDensity * weapon.size / 1000
                    for(const attack of weapon.attacks) {
                        const attack_name = weapon.name + " " + attack.name
                        const score = 10.0 - m.attack_score(attack, other_mat, mat, weapon, weapon_weight)
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
            let t = []
            for(const key in entries) {
                t.push(entries[key])
            }
            callback(t)
            })
            return null;
        },
        values() {
            let entries = []
            entries.push({
                name: this.mat.name,
                density: this.mat.solidDensity/1000,
                impact_yield: this.mat.impactYield/1000000,
                blunt_defense: 2*(this.mat.impactFracture/1000000)-(this.mat.impactYield/1000000),
                edge_defense: this.mat.shearFracture/1000000,
                edge_attack: this.mat.shearFracture/1000000 * this.mat.maxEdge / 10000
            })
            for(const mat of materials) {
                entries.push({
                    name: mat.name,
                    density: mat.solidDensity/1000,
                    impact_yield: mat.impactYield/1000000,
                    blunt_defense: 2*(mat.impactFracture/1000000)-(mat.impactYield/1000000),
                    edge_defense: mat.shearFracture/1000000,
                    edge_attack: mat.shearFracture/1000000 * mat.maxEdge / 10000
                })
            }
            return entries;
        },
    }
}
</script>