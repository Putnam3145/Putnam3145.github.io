<template>
  <b-container>
    <b-row>
      <b-col>
        <b-card>
          <b-card-title>
            Open source projects
          </b-card-title>
          <b-card-sub-title>
            Programming projects worth <i>something</i>.
          </b-card-sub-title>
      <work-entry name="Janet-D" href="https://github.com/Putnam3145/janet-d" blurb="Template-based bindings for a lisp-like">
        A high-level interface to the <b-link href="https://janet-lang.org/">Janet scripting language</b-link> for <b-link href="https://dlang.org/">D</b-link>. I primarily wrote this because I like D and don't particularly like Lua, so I was desparate to find another scripting language to work with. It's gone onto the backburner somewhat due to a combination of low interest and low demand, but it was and is very fun to make.
      </work-entry>
      <work-entry name="Dhatetris" href="https://github.com/Putnam3145/dhatetris" blurb="Hatetris TGM">
        A more standards-compliant version of qntm's <b-link href="https://qntm.org/hatetris">Hatetris</b-link>, whose <b-link href="https://qntm.org/self">Javascript love</b-link> I can respect but cannot agree with. The primary differences between the original hatetris and this one are, first, that mine goes a few levels deep using an inverse-minimax algorithm to try to find the most pessimal move a few moves ahead in parallel; second, that mine controls more like the usual standards, with T-spins, wall kicks, holds and so on. Primarily I wanted to do some OpenGL. Unfortunately, the library I was using had only compatibility with OpenGL 2, so I didn't really learn much useful.
      </work-entry>
      <work-entry name="Misc. D modules" href="https://github.com/Putnam3145/D-modules" blurb="Higher-dimensional algebra, mostly">
        A few D modules I've made: a template that implements the <b-link href="https://en.wikipedia.org/wiki/Cayley%E2%80%93Dickson_construction">Cayley-Dickson construction</b-link> over the complex numbers and beyond (the template aliases itself to complex numbers at low enough recursion), a manual implementation of quaternions, and a wrapper around an arbitrary value that lets you set that value using a function called entirely in a separate thread. That last one was made when I was pretty naive with threading, so, go easy on it.
      </work-entry>
      <work-entry name="Auxmos" href="https://github.com/Putnam3145/auxmos" blurb = "Multithreaded atmospherics plugin for BYOND">
        A total rewrite of Space Station 13's atmospherics in Rust. Multithreaded, with a lot of experiments thereof in the branches. Most of my time with it has been spent on algorithmic improvements. It performs very well, but the interface with BYOND causes a lot of grief; problems with improper refcounting on the byond side lead to nights of frustration. However, overall, the project is very fun for me, and, while some of the more monolithic functions in it horrify me, I still enjoy programming it and learning new things in the process. I even wrote my own unsafe lock-free vector, which primarily works by sharding and, of course, just panicking if it might ever need to move memory, since you just can't do that without a lock.
      </work-entry>
      <work-entry name="DF material helper" href="#" blurb = "Educational modding tool">
        I love Dwarf Fortress, and it's sparked a mild enthusiasm in me of many subjects. This is the product of one such minor enthusiasm. This is a little online widget that helps guide you through the creation of a modded material in Dwarf Fortress, providing the physical and gameplay ramifications of various material properties. Perhaps my favorite part is the elasticity page, which uses various real properties of materials Dwarf Fortress itself doesn't quite get to, and includes an embed to an interactive graph showing how the poisson ratio can be seen as a constrained proportionality constant between the elastic moduli in isotropic homogenous materials.
      </work-entry>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <b-card-title>
            Dwarf Fortress mods
          </b-card-title>
          <b-card-sub-title>
            How I got started.
          </b-card-sub-title>
        <work-entry name="Fortbent" href="http://www.bay12forums.com/smf/index.php?topic=89267.0" blurb = "Homestuck mod, oh no!">
          My first ever programming project, unfortunately. Also grew outside of scope, so hard that unlike the DBZ mod I no longer find myself able to support it. Features a new relationship system built by hacking on top of Dwarf Fortress's, a new in-game semi-economy based on goings-on elsewhere in your fortress's civilization, 144 hand-coded class/aspect combos (this was a mistake), procedurally generated combination attacks based on each of those (also a mistake), and an entire custom skills system built to support this, all in Lua. One may figure out why I said I dislike Lua.
        </work-entry>
        <work-entry name="SCP" href="http://www.bay12forums.com/smf/index.php?topic=105645.0" blurb = "SCP wiki mod">
          Less a mod and more a series of tech demos. Demonstration of Dwarf Fortress's unused multiple-souls vector with Dr. Bright; the robustness of Dwarf Fortress's materials system with SCP-294; demonstration of how complicated behavior can be replicated with mere interactions with SCP-173; and so on and so forth. Had the beginnings of a more "management-sim" like system in the form of "trust points" that can be gained by successfully containing SCPs and spent on equipment, safer SCPs etc., but I eventually decided that if I'm going to make an SCP management sim, I'd be better of making it standalone. I haven't, primarily because the idea doesn't actually interest me that much.
        </work-entry>
        <work-entry name="Sparking" href="http://www.bay12forums.com/smf/index.php?topic=100799.0" blurb = "Dragon Ball mod, what?">
          A Dragon Ball Z mod that I started when I was 17 and got waaaaaay beyond the originally planned scope. Has a fully-featured transformations system built on top of another fully-featured ki system, both written in Lua using DFHack. One may notice a pattern. The main reason this has lasted so long for me is specifically because of how much I enjoy implementing new ideas and techniques I've learned about: for a very long time, whenever I would think up a new way to interact with Dwarf Fortress, this mod is where I would do it. The overall effect is a mod that is terrifyingly fully-featured and thought-out for me; it doesn't help that I actually play it.
        </work-entry>
        <work-entry name="Fantastic" href="http://www.bay12forums.com/smf/index.php?topic=150752.0" blurb = "Mini-mods">
          I just throw whatever minor things I make into this mod pack whenever I make them. Primary feature is Materials+, which used an older version of the above material helper to implement nearly every metal on the periodic table, with reasonably accurate features. Bit of a silly mod: molybdenum short swords abound. Depending on how the steam release goes, I'm likely to break this into many smaller releases.
        </work-entry>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <b-card-title>
            Contributions
          </b-card-title>
          <b-card-sub-title>
            Contributing is as important as creating
          </b-card-sub-title>
          <b-modal id="cit_warn" body-bg-variant="dark" body-text-variant="light" header-border-variant="dark" footer-border-variant="dark" footer-bg-variant="warning" header-bg-variant = "dark" header-text-variant="light">
              Repository contains NSFW content. Are you sure?
              <template #modal-footer>
                <b-button
                  variant="success"
                   @click="$bvModal.hide('cit_warn')">No</b-button>
                <b-button
                  variant="danger"
                  href="https://github.com/Citadel-Station-13/Citadel-Station-13"
                  >Yes</b-button>
              </template>
          </b-modal>
          <work-entry name="Space Station 13" href="https://spacestation13.com/" blurb = "Before Among Us and Dwarf Fortress, there was this">
            A simulationist social deduction game. I'm a maintainer for the  <b-button variant="link" v-b-modal.cit_warn>Citadel Station 13 fork.</b-button> Actual programming work done includes overhauling the "dynamic" game mode to be more responsive to changes in game state, a <b-link href="https://github.com/Putnam3145/extools">port of C++-implemented atmospherics</b-link>, the aforementioned auxmos and optimization of NSFW game systems that it seems nobody else could tolerate dealing with.
          </work-entry>
          <work-entry name="DFHack" href="https://github.com/DFHack/dfhack" blurb = "Memory hacking library for Dwarf Fortress">
            A high-level memory hacking library for Dwarf Fortress. All of the mods on this page use it extensively. I've contributed various scripts and occasional data structure research to it. My excessive use of DFHack in modding eventually made me come to the realization that it's less "modding" that I enjoy and more "creating systems that interact with existing systems", which is why I'm a Space Station 13 maintainer now.
          </work-entry>
          <work-entry name="Auxtools" href="https://github.com/willox/auxtools" blurb = "External tools for BYOND">
            In somewhat of the same vein as DFHack. A Rust-based project that hooks into BYOND's internals, allowing access to many of its features from within a Rust program. Used to make auxmos. I've personally contributed a few bugfixes and features to it, including the methods for accessing turf tiles.
          </work-entry>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import WorkEntry from "@/components/WorkEntry.vue"

export default {
  name: 'Home',
  components: {
      WorkEntry
  },
}
</script>
