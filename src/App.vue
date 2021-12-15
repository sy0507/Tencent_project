<template>
  <div id="app">
<!--    <img src="./assets/logo.png">-->
<!--    <clip-image @saveImage="saveImage" v-if="!isSave"></clip-image>-->
<!--&lt;!&ndash;    <router-view></router-view>&ndash;&gt;-->
<!--    <div class="resultBox" @click="change" v-else>-->
<!--      <img :src="data" alt />-->
<!--    </div>-->
<!--    <router-link to="/image">test</router-link>-->
    <router-view></router-view>
  </div>

</template>

<script>
import ClipImage from "./components/ClipImage.vue";
// import "./assets/reset.min.css";
// import "./assets/basic.less";
export default {
  name: 'App',
  data() {
    return {
      isSave: false,
      data: ""
    };
  },
  components: {
    ClipImage
  },
  methods: {
    saveImage(payload) {
      this.isSave = true;
      this.data = payload;
    },
    change() {
      this.isSave = false;
    }
  }
};
</script>

<style lang="less">
.resultBox {
  padding: 0.2rem;
}

.resultBox img {
  display: block;
  box-sizing: border-box;
  width: 7.1rem;
  height: 7.1rem;
  border: 0.02rem solid #ddd;
}
</style>
