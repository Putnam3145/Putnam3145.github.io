
<template>
<b-container>
    <h1>Is it a roguelike?</h1>
    <b-form-checkbox-group stacked v-model = "selected" :options = "options" >
    </b-form-checkbox-group>
    Your game is {{score}}<br>
    <b-button variant="info" v-b-toggle.help>What do these mean</b-button>
    <b-collapse id="help">
        <p>"Heavy use of procedural generation": I personally wouldn't check this box unless the <i>maps</i> are procgen. So, Borderlands 2 doesn't get this, despite the obviously Angband-like loot, but Diablo definitely does.</p>
        <p>"Highly tactical" means that the moment-to-moment gameplay is primarily to do with making the right choices. For example, Slay the Spire passes this easily by virtue of being a deckbuilder, and in fact almost all turn-based games will pass this, and even some non-turn-based games, such as FTL.</p>
        <p>"Requires technical skill": anti-correlated with "highly tactical", but not strictly so. There are games that will pass both, such as Noita or even The Binding of Isaac, depending on the character. FTL fails this because it's real-time-with-pause.</p>
        <p> "Game flow organized around "floors" and/or "rooms"": this one's a bit hard to pin down, and one of the least valuable entries in this checklist. Basically, the gameplay's progression will likely appear to be a series of "setpieces" that are very similar run after run--Nethack has special rooms, FTL, Slay the Spire and The Binding of Isaac are all obviously room/floor-based, Tales of Maj'Eyal is dungeon-to-dungeon but still passes this. Diablo does too, actually.</p>
        <p>"Death is a part of the game flow in a way that is not game over": if you make <i>actual game progress</i> by dying, it fits this condition. Hades is my go-to example these days. Notably, a lot of games that are <i>very much not</i> roguelikes fail this: The Elder Scrolls series, most platformers... really, it's hard to find games that <i>do</i>. Roguelites are, oddly, one of the places you see this the most. The least roguelike games I can think of that fit this are Dark Souls and those it inspired.</p>
        <p>"Character building with visible stats or abilities": could not be simpler. If you have a character sheet, you pass. If you have a talent tree, you probably pass. If you have a <i>deck</i>, you pass. FTL passes by virtue of having, yes, a character sheet. Noita passes by virtue of wands, HP and perks being all the "character building" there is, and you get to see all of that at all times.</p>
        <p>"Movement entirely on a grid": Berlin definition. Included for posterity. Does not affect score. I think it's irrelevant.</p>
        <p>"ASCII graphics as an option or default": Berlin definition. Included for posterity. Does not affect score. I think it's irrelevant. Dolphin emulator used to pass this. They removed the shader right as soon as graphics cards could run it (a 3090 just manages). Sad.</p>
    </b-collapse>
</b-container>

</template>

<script>
const scores={
        procgen: 3,
        tactical: 2,
        twitchy: -3,
        rooms: 1,
        permadeath: 4,
        death_progression: -3,
        rpg_elements: 1
    }

export default {
  name: 'Roguelike',
  data() {
      return {
        selected: [
            "procgen",
            "tactical",
            "rooms",
            "permadeath",
            "rpg_elements",
            "grid_based",
            "ASCII"
        ],
        options: [
            {text: "Heavy use of procedural generation", value: "procgen"},
            {text: "Highly tactical", value: "tactical"},
            {text: "Requires technical skill (dodging, twitch aiming etc.)", value: "twitchy"},
            {text: `Game flow organized around "floors" and/or "rooms"`, value: "rooms"},
            {text: `Game has "runs" which end upon either death or victory`, value: "permadeath"},
            {text: "Death is a part of the game flow in a way that is not game over", value: "death_progression"},
            {text: "Character building with visible stats or abilities", value: "rpg_elements"},
            {text: "Movement entirely on a grid", value: "grid_based"},
            {text: "ASCII graphics as an option or default", value: "ASCII"}
        ]
      }
  },
  computed: {
      score() {
          let cur_score = 0
          for(const entry of this.selected) {
              cur_score += scores[entry] || 0
          }
          if (cur_score == 11 && this.selected.includes("grid_based") && this.selected.includes("ASCII")) {
              return "a classic(-style) roguelike"
          }
            else if (cur_score>8)
            {
                return "roguelike"
            }
            else if (cur_score>5)
            {
                if(this.selected.includes("twitchy"))
                {
                    return "a roguelite"
                }
                else
                {
                    return "roguelike...like?"
                }
            }
            else if (cur_score>0)
            {
                return "maybe rogueish"
            }
            else
            {
                return "not roguelike"
            }
      }
  }
}
</script>