<template>
<div >
  <div v-for="info in infoLists">
    <img :src="info.picBase" width="250px" height="250px">
  </div>

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
                   console.dir(it.picBase);
                   let IMAGE=new Image();
                   IMAGE.src=it.picBase;
                   console.dir(IMAGE.src);


                   IMAGE.onload=_=>{
                     canvas2CTX.drawImage(IMAGE,500,500);
                   }

                 }

               )

             }
           })
   }
  }

}
</script>

<style lang="less" scoped>

</style>
