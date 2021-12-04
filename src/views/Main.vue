<template>
<!--  <el-container style="height: 100%">-->
<!--    <el-aside width="auto"><CommonAside></CommonAside></el-aside>-->
<!--    <el-container>-->
<!--      <el-header>Header</el-header>-->
<!--      <el-main><ClipImage></ClipImage></el-main>-->
<!--&lt;!&ndash;      <el-button>xxx</el-button>&ndash;&gt;-->
<!--    </el-container>-->
<!--  </el-container>-->

  <div><ClipImage></ClipImage></div>
</template>

<script>
 import CommonAside from "../components/CommonAside";
 import ClipImage from "../components/ClipImage"
export default {
  name: "Main",
  components:{ClipImage,CommonAside}
};
</script>

<style  lang="css" scoped>

.el-header{
  background: white;
}
.el-main{
  padding-top: 0;
}

</style>
