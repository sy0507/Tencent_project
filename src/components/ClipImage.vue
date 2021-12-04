<template>
  <div class="clipImageBox">
    <div class="canvasBox">
<!--      <canvas class="canvasBox"></canvas>-->
      <canvas :width="CW" :height="CH" ref="canvas"></canvas>
      <div class="mark" v-show="isMark" :style="{width:MW+'px',height:MH+'px',left:ML+'px',top:MT+'px'}"></div>
    </div>
    <div class="buttonBox">
      <input type="file" accept="image/*" class="file" ref="file"
             @change="changeFunc"/>
      <button @click="clickFunc">选择图片</button>
      <button @click="scaleFunc(1)">放大</button>
      <button  @click="scaleFunc(0)">缩小</button>
      <button @click="saveFunc">保存图片</button>
    </div>
  </div>

</template>

<script>
export default {
  name: "ClipImage.vue",
  data(){
    let winW=document.documentElement.clientWidth,
      font=parseFloat(document.documentElement.style.fontSize),
      canvasW=winW-0.4*font,
      markW=canvasW*0.7;//是整个canvas大小的百分之七十
    return{
      //画布大小
      CW:canvasW,    //canvas画布大小
      CH:canvasW,     //正方形
      //MARK大小和位置
      MW:markW,
      MH:markW,
      ML:(canvasW-markW)/2,
      MT:(canvasW-markW)/2,
      //上传图片的大小和位置
      IW:0,        //imagewidth
      IH:0,
      IL:0,
      IT:0,
      //是否显示MARK
      isMark:false
    };
  },
  methods:{
    clickFunc(){
      this.$refs.file.click();

    },

    changeFunc(){
      this.isMark=true;
      // console.dir(this.$refs.file);
      let file=this.$refs.file.files[0];
      if (!file) return;


      let  fileExample =new FileReader();

      fileExample.readAsDataURL(file);

      fileExample.onload = ev => {
        // console.log((ev));
        this.IMAGE=new Image();
        this.IMAGE.src=ev.target.result;
        // console.dir(this.IMAGE.src);
        this.IMAGE.onload=_=>{
          this.IW=this.IMAGE.width;
          this.IH=this.IMAGE.height;
          let n = 1;
            if(this.IW>this.IH){
              n = this.IW/this.CW;
               this.IW = this.CW;
               this.IH = this.IH / n;
             }else{
               n = this.IH / this.CH;
               this.IH = this.CH;
               this.IW = this.IW / n;
          }
          this.IL=(this.CW-this.IW)/2;
          this.IT=(this.CH-this.IH)/2;

          console.log(this.IL);
          this.drawImage_cav();
        };
      };

    },
    scaleFunc(flag) {
      if (!this.IMAGE) return;
      let n = this.IW / this.IH,
        n1 = 20,
        n2 = n1 / n;
      if (flag) {
        this.IW += n1;
        this.IH += n2;
      } else {
        this.IW -= n1;
        this.IH -= n2;
      }
      this.drawImage_cav();
    },
    startFunc(ev) {
      if (!this.IMAGE) return;
      // 按下的时候获取手指的坐标
      let point = ev.changedTouches[0];
      this.startX = point.clientX;
      this.startY = point.clientY;
    },
    moveFunc(ev) {
      if (!this.IMAGE) return;
      let point = ev.changedTouches[0];
      this.changeX = point.clientX - this.startX;
      this.changeY = point.clientY - this.startY;
      if (Math.abs(this.changeX) > 10 || Math.abs(this.changeY) > 10) {
        this.IL += this.changeX;
        this.IT += this.changeY;
        this.drawImage_cav();
        this.startX = point.clientX;
        this.startY = point.clientY;
      }
    },
    saveFunc() {
      if (!this.IMAGE) return;
      // 获取指定区域的像素信息
      let imageData = this.CTX.getImageData(this.ML, this.MT, this.MW, this.MH);
      // 创建新的画布
      let canvas2 = document.createElement("canvas"),
        canvas2CTX = canvas2.getContext("2d");
      canvas2.width = this.MW;
      canvas2.height = this.MH;
      // 把像素信息放置到画布中
      canvas2CTX.putImageData(imageData, 0, 0, 0, 0, this.MW, this.MH);
      // 把画布中的内容生成图片的BASE64
      this.$emit("saveImage", canvas2.toDataURL("image/png"));
    },

    drawImage_cav(){
      this.CTX=this.$refs.canvas.getContext('2d');
      // console.log(this.CTX);
      this.CTX.clearRect(0,0,this.CW,this.CH);
      this.CTX.drawImage(this.IMAGE,this.IL,this.IT,this.IW,this.IH);


    }

  }
}
</script>

<style lang="less" scoped>
.clipImageBox{
  padding: 0.2rem;
}
.clipImageBox.canvasBox{
  position: relative;
  overflow: hidden;
}
.clipImageBox.canvasBox canvas{
  display: block;
  box-sizing: border-box;
  margin: 0 auto;
  width: 7.1rem;
  height: 7.1rem;
  border: 0.02rem solid #ddd;
}
.clipImageBox .canvasBox .mark{
  box-sizing: border-box;
  position: absolute;
  z-index: 20;
  width: 70%;
  height: 70%;
  border: 0.02rem dashed lightcoral;
  background: rgba(0,0,0,0.2);
}

.clipImageBox .buttonBox .file{
  display: none;
}

.clipImageBox .buttonBox {
  margin-top: 0.3rem;
}

.clipImageBox .buttonBox button {
  margin-right: 0.2rem;
  padding: 0.2rem;
  border: none;
  font-size: 0.28rem;
  background: lightblue;
  cursor: pointer;
}

</style>
