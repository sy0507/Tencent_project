<template>
  <div id="app">
    <div class="clipImageBox">
      <canvas width="500px" height="500px" ref="canvas"></canvas>
      <canvas ref="canvasB" width="500px" height="500px"></canvas>
      <div class="buttonBox">
      <input type="file" accept="image/*" class="file" ref="file"
             @change="changeFunc"/>
      <el-button @click="clickFunc">
        上传图片
      </el-button>
        <el-button @click="grey">
          灰度滤镜
        </el-button>
        <el-button @click="black()">
          黑白滤镜
        </el-button>
        <el-button @click="reverse()">
          反色滤镜
        </el-button>
        <el-button @click="blured()">
          模糊滤镜
        </el-button>
        <el-button @click="mosaic()">
          马赛克滤镜
        </el-button>
        <el-button>
          <router-link to="first">
            图片列表
          </router-link>
        </el-button>
      </div>
<!--  <router-view>-->
<!--  </router-view>-->
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "home",
  data(){
    // this.ctxB=this.$refs.canvasB.getContext('2d');
    return{
      IW:0,
      IH:0,
      IL:0,
      IT:0,
      name:"",
      picBase:""
    }
  },
  methods:{
    clickFunc() {
      this.$refs.file.click();
    },
    changeFunc() {
      let  file=this.$refs.file.files[0];
      if (!file) return;
      let fileExample =new FileReader();
      fileExample.readAsDataURL(file);
      console.log(file.name);

      fileExample.onload=ev => {
        this.Image=new Image();
        this.Image.src=ev.target.result;
        this.Image.onload=_=>{
          this.IW=500;
          this.IH=500;
          this.drawImage();
          let params={
            name:file.name,
            picBase:this.Image.src
          };
          axios.post('http://localhost:90/pic/addPic',params)
               .then(function (response){
                 console.log(response);
               })
          .catch(function (error){
            console.log(error)
          })
        }

      }
    },
    drawImage() {
      this.CTX=this.$refs.canvas.getContext("2d");
      this.CTX.clearRect(0,0,500,500);
      this.CTX.drawImage(this.Image,this.IL,this.IT,this.IW,this.IH);
    },
    grey(){
      let imageData=this.CTX.getImageData(0,0,500,500);
      let pixelData=imageData.data;
      this.cxtb=this.$refs.canvasB.getContext('2d');
      this.cxtb.clearRect(0,0,500,500);
      for (let  i=0;i<500*500;i++)
      {
        let r=pixelData[i*4+0];
        let g=pixelData[i*4+1];
        let b=pixelData[i*4+2];

        let grey=r*0.3+g*0.59+b*0.11;

        pixelData[i*4+0] = grey
        pixelData[i*4+1] = grey
        pixelData[i*4+2] = grey

      }
      this.cxtb.putImageData(imageData,0,0,0,0,500,500)

    },
    black(){
      let imageData=this.CTX.getImageData(0,0,500,500);
      let pixelData=imageData.data;
      this.cxtb=this.$refs.canvasB.getContext('2d');
      this.cxtb.clearRect(0,0,500,500);
      for (let  i=0;i<500*500;i++)
      {
        let r=pixelData[i*4+0];
        let g=pixelData[i*4+1];
        let b=pixelData[i*4+2];

        let grey=r*0.3+g*0.59+b*0.11;

        let v;
        if (grey>255/2){
          v=255
        }

        else {
          v=0
        }

        pixelData[i*4+0] = v
        pixelData[i*4+1] = v
        pixelData[i*4+2] = v

      }
      this.cxtb.putImageData(imageData,0,0,0,0,500,500)

    },
    reverse(){
      let imageData=this.CTX.getImageData(0,0,500,500);
      let pixelData=imageData.data;
      this.cxtb=this.$refs.canvasB.getContext('2d');
      this.cxtb.clearRect(0,0,500,500);
      for (let  i=0;i<500*500;i++)
      {
        let r=pixelData[i*4+0];
        let g=pixelData[i*4+1];
        let b=pixelData[i*4+2];

        // let grey=r*0.3+g*0.59+b*0.11;

        pixelData[i*4+0] = 255-r
        pixelData[i*4+1] = 255-g
        pixelData[i*4+2] = 255-b

      }
      this.cxtb.putImageData(imageData,0,0,0,0,500,500)

    },
    blured(){
      let imageData=this.CTX.getImageData(0,0,500,500);
      let pixelData=imageData.data;
      this.cxtb=this.$refs.canvasB.getContext('2d');
      this.cxtb.clearRect(0,0,500,500);
      let  tmpImgData=this.CTX.getImageData(0,0,500,500);
      let tmpPixelData=tmpImgData.data;

      let blurR=3;

      let totalNum=(2*blurR+1)*(2*blurR+1);

      for (let i=blurR;i<500-blurR;i++) {
        for (let j = blurR; j < 500 - blurR; j++) {
          let totalR = 0, totalG = 0, totalB = 0;

          for (let dx = -blurR; dx <= blurR; dx++) {
            for (let dy = -blurR; dy <= blurR; dy++) {
              let x = i + dx;
              let y = j + dy;


              let p=x*500+y;

              totalR+=tmpPixelData[p*4+0];
              totalG+=tmpPixelData[p*4+1];
              totalB+=tmpPixelData[p*4+2];
            }
          }
          let p=i*500+j;
          pixelData[p*4+0]=totalR/totalNum;
          pixelData[p*4+1]=totalG/totalNum;
          pixelData[p*4+2]=totalB/totalNum;
        }
      }
      this.cxtb.putImageData(imageData,0,0,0,0,500,500)
    },
    mosaic(){
      let imageData=this.CTX.getImageData(0,0,500,500);
      let pixelData=imageData.data;
      this.cxtb=this.$refs.canvasB.getContext('2d');
      this.cxtb.clearRect(0,0,500,500);
      let  tmpImgData=this.CTX.getImageData(0,0,500,500);
      let tmpPixelData=tmpImgData.data;

      let size=25;

      let totalNum=size*size;

      for (let i=0;i<500;i+=size) {
        for (let j = 0; j < 500 ; j+=size) {
          let totalR = 0, totalG = 0, totalB = 0;

          for (let dx = 0; dx <size; dx++) {
            for (let dy = 0; dy < size; dy++) {
              let x = i + dx;
              let y = j + dy;


              let p=x*500+y;

              totalR+=tmpPixelData[p*4+0];
              totalG+=tmpPixelData[p*4+1];
              totalB+=tmpPixelData[p*4+2];
            }
          }
          let p=i*500+j;
          let resR=totalR/totalNum;
          let resG=totalG/totalNum;
          let resB=totalB/totalNum;
          for (let dx=0;dx<size;dx++){
            for (let dy=0;dy<size;dy++){
              let x=i+dx;
              let y=j+dy;

              let p=x*500+y;
              pixelData[p*4+0]=resR;
              pixelData[p*4+1]=resG;
              pixelData[p*4+2]=resB;
            }
          }
        }
      }
      this.cxtb.putImageData(imageData,0,0,0,0,500,500)

    }

  }
}
</script>

<style lang="less" scoped>
.clipImageBox .buttonBox .file{
  display: none;
}
.clipImageBox .buttonBox{
  margin-top: auto;
//margin-top: 550px;
}
.clipImageBox .buttonBox el-button{
  background: lightblue;
}

</style>
