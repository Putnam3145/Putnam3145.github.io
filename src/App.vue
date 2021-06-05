<template>
  <div id="app" class="dark">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/helper">DF material helper</router-link> |
      <router-link to="/roguelike">Roguelike?</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
@import "app.scss";
@import "../node_modules/katex/dist/katex.min.css";
</style>
