<template>
<div >
  <el-main>
    <el-table :data="infoLists">
      <el-table-column label="id" align="center">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>

      </el-table-column>
      <el-table-column label="图片" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.picBase" width="300px" height="200px"
            >
        </template>
<!--        <template >-->
<!--          <div  v-for="info in infoLists">-->
<!--            <img :src="info.picBase" width="250px" height="250px">-->
<!--          </div>-->
<!--        </template>-->

<!--        <img :src="info.picBase" width="250px" height="250px">-->

      </el-table-column>
      <el-table-column label="操作"  align="center">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)">处理</el-button>
          <el-button>删除</el-button>
        </template>

      </el-table-column>
    </el-table>
  </el-main>


</div>
</template>

<script>
import axios from "axios";

export default {
  name: "first",
  data(){
    return{

      infoLists:[]
    }
    // name:"",
    // picBase:"",


  },
  mounted() {
    this.getPic();
  },
  methods:{
    getPic(){
      let that=this;
      axios.get('http://localhost:90/pic/List')
           .then(function (response){
             // console.log(response);
             let result=response.data;
             console.log("okkkk");
             console.log(result.status);
             if (result.status==0){
               that.infoLists=result.data;
               // console.log("okkkk");
               console.dir(that.infoLists);
               console.dir(that.infoLists.length);
               that.infoLists.forEach(it =>
                 {
                   let canvas2=document.createElement("canvas"),
                     canvas2CTX=canvas2.getContext("2d");
                   canvas2.width=500;
                   canvas2.height=500;
                   // console.dir(it.picBase);
                   let IMAGE=new Image();
                   IMAGE.src=it.picBase;
                   // console.dir(IMAGE.src);


                   IMAGE.onload=_=>{
                     canvas2CTX.drawImage(IMAGE,500,500);
                   }

                 }

               )

             }
           })
   },

   handleClick(row){
      // console.log(row.picBase);
      this.$router.push({
        path:'/home',
        query:{
          id:row.id,
          picBase:row.picBase
        }
      })
   }
  }

}
</script>

<style lang="less" scoped>

</style>
