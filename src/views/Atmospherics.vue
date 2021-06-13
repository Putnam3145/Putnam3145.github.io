<template>
    <b-container class="article-text">
        <h1>WARNING: ROUGH DRAFT</h1>
        <h2>Introduction</h2>
        <p>Space Station 13 is a deeply complex social deduction game. Think Among Us crossed with Dwarf Fortress, although it should be noted that it's older than either<sup><citation id="1">Yeah, older than Dwarf Fortress. That game's first release was 2006, SS13's was <b-link href="https://secure.byond.com/games/Exadv1/SpaceStation13">2003.</b-link></citation></sup>. The game is primarily famous for being something of a freeform trolling engine—due to its open source nature and complex mechanics, a lot of features have been added to it over the years that allow for a lot of strange situations. Why is a wizard attacking a space station, and why do they only seem to know how to conjure guns, and why are they just giving the guns away?<citation id="2">Actually, I <b-link href="https://gunshowcomic.com/30">know this one.</b-link></citation> That sort of thing.</p>

        <p>Simulation of gases usually involves solving a partial differential equation given initial conditions; since we're only talking diffusion, that would be the <b-link href="https://en.wikipedia.org/wiki/Laplace_operator">laplacian.</b-link> I expect some basic knowledge of this in this article, but I'll try to include explanations here and there. I recommend <b-link href="https://www.youtube.com/watch?v=p_di4Zn4wz4">the 3blue1brown series on partial differential equations</b-link>, especially, and I'll link relevant bits as I go, because they're <i>seriously</i> helpful for understanding. To summarize in simple terms: every point in space has a value, and that value changes over time towards the average of the values around it. There’s a variety of methods to solve this, and most of them rely on taking the initial conditions and transforming them some way or another into something that’s easier to compute.</p>

        <p>However, we have a problem: the density at a given point can change arbitrarily, because this is a video game where unpredictable agents<citation id="3">(or “players” for short)</citation> can muck things up at any time. Therefore, instead of getting a solution to the equation, where we can just take f(x,y,t) and get a nice clean value, we have to simulate it every tick. So, how do we do this?</p>
        <h2>The finite difference Method</h2>
        <p>The trick is to divide the problem space up into a finite amount of chunks and then, each “tick”, calculate the changes cell-by-cell. 
        <b-embed type="video" aspect="16by9" aria-label = "A sine wave is drawn on a graph as the phrase 'finite difference method' is drawn above it. Vertical lines appear separating the sine wave into regions, and then each individual region of the sine wave is turned into a line with the average value of that region." controls>
            <source src="./../assets/FiniteDifference3.mp4" type="video/mp4">
        </b-embed>
        This is actually a solved problem.<citation id="4"><b-link href="https://www.researchgate.net/publication/2560062_Real-Time_Fluid_Dynamics_for_Games">Stam, Jos. "Real-Time Fluid Dynamics for Games.”</b-link></citation> In essence, we take all the chunks, put them into a two-dimensional array,<citation id="5">Or what-have-you. It really, really depends, always does.</citation> and compare each member to its neighbors, changing how much gas they have based on the difference. Say you have 10 moles of gas in this center area. How much should there be next tick, in the surrounding ones? Well, let’s say the maximum amount diffuses every tick; since each tile can only have up to 4 cardinal neighboring tiles in 2D, let’s say 1/5 of the gas gets shared to each adjacent tile each tick. So, we do this calculation: first tile has 0 gas; second tile’s neighbor shares 1/5 of its gas, leading to this tile having 2 moles; 3rd has none; 4th is same as 2nd; fifth loses 1/5 of its gas to each neighboring tile, so it’s left with 2 moles; and so on.</p>

        <fdm-demonstration />

        <p>It should be noted that this isn't actually doing all the calculations in-place--internally<citation id="6"><b-link href="https://github.com/Putnam3145/putnam3145-github-io-wasm/blob/b188585bd22494fe31466c8c033b7d7b095d8c77/src/lib.rs#L179">See here.</b-link></citation>, it's making a copy by mapping a read-only version of the input.<citation id="7">This is actually a lot like many lock-free data structures.</citation></p>

        <p>This can get hard to follow for a human rather quickly, but a computer doesn't really see the difference between something simple and something very complicated.</p>

        <h2>LINDA</h2>
        <p>SS13’s original implementation of this was in a file called FEA.dm, short for “finite element analysis”. People, naturally, started calling the system itself FEA. I am not familiar with FEA, in fact; I have only worked with LINDA, /tg/station’s own atmospheric system, which has the same DNA as the research paper above, but with a lot of caveats and changes in order to ensure performance.</p>

        <p>I should note at this point: the 2D representations so far is actually something of a lie. LINDA can work in arbitrary dimensions. However, most SS13 maps are 2D, at least atmospheric-wise.</p>

        <p>The most important innovation LINDA introduces is the ability to pause at any arbitrary time during simulation, deferring continued simulation until later. This technically doesn’t improve performance in the sense of CPU time taken to simulate—in fact, it makes it worse. What it does do, however, is make it so that the game can still run while atmospheric simulation takes place. This is an extremely important feature, and LINDA does it very well.</p>

        <b-embed type="video" aspect="16by9" aria-label = "A grid of cells with a dot in the bottom left corner is on screen. The dot's center shifts to blue, and then the surrounding cells flash. It moves one cell to the right, then the surrounding cells flash again, as a number in the top right counts down from 1. This continues until the number is below 0, at which point the dot turns brown." controls>
            <source src="./../assets/LINDA.mp4" type="video/mp4">
        </b-embed>

        <p>The second thing LINDA does is introduce excited groups. Due to diffusion being a very slow process in practice—it takes quadratic time to fill up a room, relative to the maximum distance from a given source—it keeps track of groups, which merge together and cool down via criteria established later. Once cooled down, a group will equalize all gas in its region, and eventually destroy itself.</p>

        <b-embed type="video" aspect="16by9" aria-label = "We start with a grid of cells, all brown. One cell turns blue, then the cells adjacent to it, then the cells adjacent to those, then the rest of the grid." controls>
            <source src="./../assets/Excited.mp4" type="video/mp4">
        </b-embed>

        <p>The third thing it does is simply not simulate tiles that aren’t sufficiently different from the surroundings. This requires a lot of bookkeeping, and relies on anything adding new gases to be good and report that it’s doing so. However, it does work, and very well.</p>

        <b-embed type="video" aspect="16by9" aria-label = "A grid of numbers is drawn on screen, randomly assigned from 9 to 11. The numbers are then all colored blue and brown; the only blue numbers are numbers which have at least one adjacent number that is not the same. The blue numbers are then highlighted." controls>
            <source src="./../assets/Optimize.mp4" type="video/mp4">
        </b-embed>

        <p>But then the question arises: how does a system stay consistent while doing these? After all, the original system relied on <i>copying</i> the array.</p>

        <p>Zeroth thing: whenever certain changes to the gas are made, it’s archived, and saves last time it was archived. This archive is the most important thing to ensure consistency—the second array that the dedicated system uses is, essentially, encoded in the gas mixture itself.</p>

        <p>Before any tiles are processed, at the start of the processing step, it copies the active turfs list, to make sure we don’t work on the same turf twice, or miss one because something removed it from active for spurious reasons. Once this copy happens, it goes through the queue, taking a turf, removing it from the queue, then processing it. The process goes as follows.</p>

        <p style="text-align:center"><b-button variant="info" v-b-toggle.math-dropdown>Math terms definitions</b-button>
        <b-collapse id="math-dropdown">
            <katex-element display-mode expression="
            \begin{align*}
            G&: \text{The total number of gas types; equivalently, the set of all gas types.}\\
            g_i&: \text{The ith gas of mixture g. Gas mixtures are represented by lower-case letters.}\\
            g_{ia}&: \text{ith archived gas mixture.}\\
            g_T&: \text{The temperature of mixture g.}\\
            \forall n \in G&: \text{For all gas types.}\\
            g_{tot}&: \sum_{n \in G}g_n \\
            c_n&: \text{The heat capacity for gas } n \in G\\
            g_Q&: \text{The total heat of a gas (calculated by } \sum_{n \in G}g_nc_n \text{)}\\
            \text{Merging gases}&:g + g \rightarrow g\\
            \text{Scalar multiplication:}&:g \cdot \R \rightarrow g\\
            &\text{The above two do basically what you'd expect for, say, vector addition, with the added wrinkle of }\\
            &\text{heat capacities.}
            \end{align*}" /> </b-collapse></p>

        <p>First, we check if it’s been archived this tick; if it hasn’t, we do that immediately. Second, we go through each adjacent tile. For each adjacent tile, we first check if that tile’s already been processed; if it has, we skip it. Otherwise, we archive it (we know this is consistent due to the fact that we skip!), then compare our excited groups. If we have different excited groups, we merge them. If the other tile isn’t in an excited group at all, we compare our gas to the other’s gas, and if it’s different, we add the other gas to the active processing list, then either add it to our excited group, add us to their excited group, or make a new one and add both to it. Then: 
        <code-math-prose expression="\begin{align*} \forall n \in G&: \\
        \Delta_n &:= \frac{a_{na}-b_{na}}{|N|+1}\\
        a_n &:= a_{na} - \Delta_n\\
        b_n &:= b_{na} + \Delta_n
        \end{align*}" code = "
for gas in gases {
    let delta = (self.get_gas_archived(gas) - sharer.get_gas_archived(gas)) 
                / neighbors.count();
    self.adjust_gas(gas, -delta);
    sharer.adjust_gas(gas, delta);
    //some stuff with heat capacities, too, but this is the gist of it
}">
        For each gas, we get the difference in the gas amounts in each gas's archive, then divide by the number of adjacent tiles; then, we add the difference to the other turf, and subtract the difference from our turf.
        </code-math-prose>
            Note that "neighbors" here might include a possible special “planetary atmos” fake tile that represents the average gas composition of a planet. Then, we do a temperature share, which is the same applied to heat: 
            <code-math-prose expression="\begin{align*} \Delta T &:= a_{Ta}-b_{Ta}\\
        \Delta Q &:= 0.4\Delta T \frac{a_{Qa}b_{Qa}}{a_{Qa}+b_{Qa}}\\
        a_T &:= a_{Ta} - \frac{\Delta Q}{a_Q} \\
        b_T &:= b_{Ta} + \frac{\Delta Q}{b_Q}
        \end{align*}" code = "
let temperature_delta = 
    self.temperature_archived - sharer.temperature_archived;
let self_heat_capacity = self.heat_capacity_archived();
let sharer_heat_capacity = sharer.heat_capacity_archived();
let heat = 0.4 * temperature_delta
    * (self_heat_capacity * sharer_heat_capacity
    / (self_heat_capacity + sharer_heat_capacity));
self.temperature = 
    self.temperature_archived - heat / self_heat_capacity);
sharer.temperature = 
    sharer.temperature_archived + heat / sharer_heat_capacity;
}
">
    First, we calculate the difference in temperatures. Using this, we then calculate the heat difference via some basic dimensional analysis (you don't have to think about it too hard, in other words) and exchange heat that way. We multiply the heat exchange by the conduction coefficient, which in this case is 0.4.
</code-math-prose> After this, we finally set the tile and all of its neighbors’ last_share value to the current tick, ensuring that this tile won’t be shared again this tick, and we reset the cooldowns on its excited groups.</p>

        <p>Now that the tile is done processing, we check if we’ve been processing gases too long, relative to maximum length of the tick; if we have, we pause the subsystem, letting the rest of the game run, to resume the queue later.</p>

        <p>This is LINDA, and it works quite well. But it is slow. Not just in terms of gases spreading; it’s computationally very slow, as well. So, how do we make this faster?</p>

        <p>Well... we don't. BYOND is not a fast engine. As long as we have to write the processing in byond, this is just about as good as it gets, unless you switch to totally different systems like ZAS, which has area-based atmospherics instead of turf-based.</p>

        <p>But what if we don't have to write the processing in byond?</p>

        <h2>Extools</h2>
        <p>In comes <b-link href="https://github.com/MCHSL/extools">extools</b-link>, a tool that can be used to interface directly with BYOND memory using C++. Initially, LINDA (and, in fact, all gas mixture processing) was ported to C++ by monster860. I ported this to Citadel station. However, I then wanted to add new gases, and found that it had some odd architecture choices: the max amount of gases was hardcoded, and gas mixtures used C-style arrays to store them; not only that, but gas mixtures were created by allocating one in an <code>std::shared_ptr</code>, then storing the pointer as a float (by casting it bitwise, so this was safe).</p>
        
        <p>I decided this should be rectified. I switched all of the gas mixture code to more modern C++ constructions, making gas mixtures stored in a vector and using the STL instead of <code>memcpy</code> and such. Most importantly, I switched the raw pointer saving with a simple vector that saves deallocated gas mixture locations<citation id="8">This turns out to essentially be <b-link href="https://en.wikipedia.org/wiki/Region-based_memory_management">region-based memory management.</b-link></citation> This made the whole thing something like 3-4 times as fast, probably primarily due to cache locality<citation id="9">So easy to blame the cache locality.</citation>, though auto-vectorization did help. At this point, everything seemed good... until I couldn’t update atmos anymore without causing lavaland, the planetary mining zone in TGstation servers, to explode, usually instantly, with baffling floating point errors.</p> 
        
        <h2>Auxtools</h2>
        <p>This was a problem for a while. Soon, however, <b-link href="https://github.com/willox/auxtools">auxtools</b-link> came about: a Rust-based successor to extools. With this, I immediately began working on “<b-link href="https://github.com/Putnam3145/auxmos">auxmos</b-link>”, a Rust implementation of atmospherics. Note that I said <i>atmospherics</i>: this is no longer LINDA. Instead, I implemented an entirely new system, based on the paper mentioned before (it comes up a lot!). Here’s how the new system works.</p>

        <p>
            <code-math-prose 
                    expression="\begin{align*} \text{With }N&: \text{neighbor gases of tile } t\\
                    m&: \frac{1}{8}\sum_{o \in N}o\end{align*}" code="
let m = GasMixture::new();
for neighbor in t.neighbors {
    m.merge(neighbor.gas)
}
">
                Take gases from all of neighbor turfs, add them together, then multiply it by 1/8.
            </code-math-prose>
        As we do this, we also do the following check:
        <code-math-prose expression="\begin{align*}
        \exist o \in& N:\\
        &|t_T - o_T| > 4 \land \\
        &t_{tot} \ge 0.1 \lor \\
        &\exists n \in G: |t_n-b_n| > 0.1
        \end{align*}" code="
t.neighbors.any(|neighbor| {
  (t.temperature - t.temperature).abs() > 4 
    && t.total_moles() > 0.1
    || all_gases.any(
      |gas| (t.get_gas(gas) - neighbor.get_gas(gas)).abs() > 0.1
    )
})
">
            If the gases are of different enough temperature and our gas has enough moles for this to matter, pass; otherwise, pass if any individual gas is more than 0.1 moles away from the neighbor's gas.
        </code-math-prose>
        If this statement is true, then we'll keep <katex-element expression="m"/> around for later, associated with the gas ID of <katex-element expression="t"/>. Once every single turf is processed this way, we go through all of the turfs that passed the condition earlier, setting their gas mixtures:<code-math-prose expression="t := m + t \cdot 1-\frac{|N|}{8}" code="
t.multiply(1 - (neighbors.count()/8))
t.merge(m)
">
            Take our turf's gas mixture, multiply it by one minus the number of neighbor turfs divided by 8, then merge it with the gas mixture from earlier, <katex-element expression="m"/>.
            </code-math-prose>And thus we have diffused, just as LINDA does.</p>

        <h2>Why do things this way?</h2>
        <p>Why <katex-element expression="\frac{1}{8}"/>, instead of <katex-element expression="\frac{1}{|N|+1}"/>? I have a few reasons. First of all, it makes the math easier to follow; if you always know gases lose exactly 1/8 of their gas per adjacent turf per tick, noticing problems is much easier. This is not a hypothetical--I had a long-running race condition solved by doing the math in my head and realizing exactly what happened. Second, <katex-element expression="\frac{F}{8}"/> always retains its exact precision in floats--precision issues are nasty to deal with, and while the error is never going to be big, it adds up over hours of doing these operations twice a second. Third, <katex-element expression="8 \ge |N|+1"/>—the largest <katex-element expression="|N|+1"/> can be in practical terms is, in fact, 8, for turfs with 6 neighbors that are on a planet. LINDA used to also have some sort of particle that makes turfs adjacent atmos-wise, but losing that is acceptable, to my eyes</p>

        <p>Second of all, why wait until we've checked every turf?? Simply put, the fact that we create every to-merge gas mix first means that we have an archive built-in—during calculations, not a single gas mixture is modified—all modifications come in the merging step, after we’ve already calculated all of them… and, even better, we can parallelize this step, to, because each step is completely independent of all the rest.</p>

        <p>But wait, you may ask, wouldn’t this cause lag, due to the fact that it’s both increasing the total workload by never pausing turfs and the fact that it never pauses to let the game run? The answer is no, albeit only because the entire thing is highly parallelizable. Each individual gas mixture can, in theory, be done completely independently from the others, with only some read-sharing involved. In practice, I use a parallel library called DashMap combined with rayon to run each individual “shard” of the DashMap in parallel, which leads to a pretty much linear speedup with number of cores. On top of that, the entire process is started on another core, meaning that the game experiences no interruption as it runs—in fact, the game starts the thread, does a bunch of processing relating to atmos that isn’t on tiles while the thread is running, then waits for the thread to finish if it hasn’t yet before doing turf operations. In practice, it usually finishes far before it gets to that point, meaning that, as far as the player knows, this entire process causes zero performance impact.</p>

        <p>There’s a few more reasons: doing everything at once requires less bookkeeping, and is thus simpler; the archive no longer being required means there’s less memory being allocated, which improves performance, and gives more breathing room, since SS13 is still 32-bit; copy-and-multiply is a far simpler operation than going through each individual gas and doing calculations on them, and can be vectorized by the compiler; and quite a few others.</p>

        <h2>Why write this?</h2>
        <p>This is all an open source project. I'm hoping that I won't be the only person on the planet who understands it well enough to work on it <i>and</i> cares enough to actually do it. By writing this, I want either people who care to learn how to work on it or people who can work on it to start caring. I don't mind working on these things, I enjoy it greatly<citation id="citation needed">Actually, no, a <b-link href="https://en.wikipedia.org/wiki/Cessna_Citation_family">private jet</b-link> would be unethical, huh?</citation>, but the <b-link href="https://en.wikipedia.org/wiki/Bus_factor">bus factor</b-link> is a terrifying thing, and I hope to reduce it. Please consider <b-link href="https://github.com/Putnam3145/auxmos">contributing to Auxmos</b-link>, even if it's providing insights I might not have thought of (this happens more often than you'd think).</p>
    </b-container>
</template>

<script>
import Citation from "@/components/Citation.vue"
import CodeMathProse from "@/components/CodeMathProse.vue"
import fdmDemonstration from "@/components/fdmDemonstration.vue"
export default {
    components: {
        Citation,
        CodeMathProse,
        fdmDemonstration,
    },
}
</script>