<template>
<div style="text-align:center">
    <katex-element display-mode :expression = displayArray />
    <b-button @click="do_fdm" variant="success">Run once</b-button>
    </div>
</template>

<script>
let wasm = import('@/wasm/pkg/putnam_github_io_bg')

const width = 8;

export default {
    data() {
        return {
            array: [
                0.0, 1.0, 2.0, 3.0,
                4.0, 5.0, 6.0, 7.0,
                8.0, 9.0, 10.0, 11.0,
                12.0, 13.0, 14.0, 15.0,
            ]
        }
    },
    mounted() {
        this.array = Array.from(Array(width*width)).map((v, i) => i)
    },
    computed: {
        displayArray() {
            let ret = "\\begin{matrix}"
            let done = 0
            for(let i of this.array) {
                done = (done + 1) % width
                ret += Math.round(i * 100) / 100
                if (done == 0) {
                    ret += "\\\\"
                } else {
                    ret += " & "
                }
            }
            return ret + "\\end{matrix}"
        }
    },
    methods: {
        do_fdm() {
            let me = this;
            wasm.then(m => {
                me.array = m.fdm(Float64Array.from(me.array), width)
            })
            return null;
        }
    }
}
</script>