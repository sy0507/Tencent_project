<template>
    <el-container style="height: 950px; border: 1px solid #eee">
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-openeds="['1', '3']">
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-message"></i>滤镜操作</template>
            <el-menu-item-group>
              <template slot="title"></template>
              <el-menu-item index="1-1" @click="grey">灰度滤镜</el-menu-item>
              <el-menu-item index="1-2" @click="blured">模糊滤镜</el-menu-item>
              <el-menu-item index="1-3" @click="black">黑白滤镜</el-menu-item>
              <el-menu-item index="1-4" @click="reverse">反色滤镜</el-menu-item>
              <el-menu-item index="1-5" @click="mosaic">马赛克滤镜</el-menu-item>
            </el-menu-item-group>
          <el-submenu index="2">
            <template slot="title"><i class="el-icon-menu"></i>图片操作</template>
            <el-menu-item-group>
              <template slot="title"></template>
              <el-menu-item index="2-1" @click="translation">平移</el-menu-item>
              <el-menu-item index="2-2" @click="Rotate">旋转</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title"><i class="el-icon-setting"></i>绘画</template>
          </el-submenu>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main>
        <canvas width="1500px" height="800px" ref="canvas" id="canvas"></canvas>
        <div class="tool-container">
          <div class="icon-div icon" @click="isShowDrawPane = !isShowDrawPane">
            <icon name="draw" scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="filterObject('erase')">
            <icon name="erase" scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="filterObject('line')">
            <icon name="line" scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="filterObject('arrows')">
            <icon name="arrows" scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="filterObject('rect')">
            <icon name="rect" scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="filterObject('circle')">
            <icon name="circle" scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="filterObject('text')">
            <icon name="text" scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="clearCanvas()">
            <icon name="clear" scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="redo()">
            <icon :name="historyImageData.length > 0 ? 'redo' : 'grey-redo' " scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="cancelRedo()">
            <icon :name="newHistoryImageData.length > 0 ? 'cancelRedo' : 'grey-cancelRedo' " scale="4"></icon>
          </div>
          <div class="icon-div icon" @click="downLoad()">
            <icon name="download" scale="4"></icon>
          </div>
          <div class="drawPane" v-show="isShowDrawPane">
            <div @click="isShowDrawPane = false">
              <icon class="close-draw-pane icon" name="close" scale="3"></icon>
            </div>
<!--            <h5>画笔大小</h5>-->
            <input type="range" id="lwRange" min="1" max="10" value="1" />
<!--            <h5>画笔颜色</h5>-->
            <input type="color" id="lcolor" value="#ffa500" />
          </div>
        </div>
        <textarea
          id="textarea"
          name="textBox"
          cols="9"
          rows="1"
          class="text-style"
          v-show="isShowText"
        ></textarea>

        <canvas ref="canvasB" width="500px" height="500px"></canvas>
<!--        <drawing></drawing>-->

      </el-main>
    </el-container>
</template>

<script>
import axios from "axios";
import drawing from "./drawing";
export default {
  name: "home",
  props: {
    msg: String,
  },
  data(){
    return{
      IW:0,
      IH:0,
      IL:0,
      IT:0,
      name:"",
      picBase:"",
      picId:"",
      x:0,
      y:0,
      rotation:0,
      isShowDrawPane: false,
      canvas: null,
      context: null,
      //线宽
      lwidth: 2,
      //画笔颜色
      lcolor: "orange",
      //维护绘画状态的数组

      paintTypeArr: {
        painting: false,
        erase: false,
        line: false,
        arrows: false,
        rect: false,
        circle: false,
        text: false,
      },
      //最近一次的canvas图片的数据
      imageData: null,
      //是否显示文字编写框
      isShowText: false,
      //保存画布图片历史的数据
      historyImageData:[],
      //保存已被撤销的历史画布图片数据
      newHistoryImageData:[],
      socket:null
    };
  },
  components:{
    drawing,
  },
  created() {
    this.getParams();
    this.drawPic();
  },
  mounted() {
    let self = this;
    self.init()
    // window.onresize = function () {
    //   self.init()
    // }
    document.getElementById("lwRange").onchange = function () {
      self.lwidth = parseInt(document.getElementById("lwRange").value)
    }
    document.getElementById("lcolor").onchange = function () {
      self.context.fillStyle = document.getElementById("lcolor").value
      self.context.strokeStyle = document.getElementById("lcolor").value
    }
    this.listen()
  },
  methods:{
    init() {
      this.canvas = document.getElementById("canvas")
      this.context = this.canvas.getContext("2d")
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      this.imageData && this.context.putImageData(this.imageData, 0, 0)
    },

    componentWillUnmount(){
      // 取消滚动事件
      window.onscroll = null;
    },
    listen() {
      let self = this
      let lastPoint = { x: undefined, y: undefined }
      let rect = self.canvas.getBoundingClientRect()
      var scaleX = self.canvas.width / rect.width
      var scaleY = self.canvas.height / rect.height
      let textPoint = { x: undefined, y: undefined }

      self.canvas.onmousedown = function (e) {
        self.paintTypeArr["painting"] = true

        let x1 = e.clientX
        let y1 = e.clientY
        x1 -= rect.left
        y1 -= rect.top
        lastPoint = { x: x1 * scaleX, y: y1 * scaleY }

        if (self.paintTypeArr["text"]) {
          let textarea = document.getElementById("textarea")
          if (self.isShowText) {
            let textContent = textarea.value
            self.isShowText = false
            textarea.value = ""
            self.drawText(textPoint.x, textPoint.y, textContent)
          } else if (!self.isShowText) {
            self.isShowText = true

            textarea.style.left = lastPoint.x + "px"
            textarea.style.top = lastPoint.y + "px"
            textPoint = { x: lastPoint.x, y: lastPoint.y }
            // textarea.style['z-index'] = 6
          }
        }

        if (self.paintTypeArr["erase"]) {
          let ctx = self.context
          ctx.save()
          ctx.globalCompositeOperation = "destination-out"
          ctx.beginPath()
          let radius = self.lWidth / 2 > 5 ? self.lWidth / 2 : 5
          ctx.arc(lastPoint.x, lastPoint.y, radius, 0, 2 * Math.PI)
          ctx.clip()
          ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
          ctx.restore()
        }

        var thee = e ? e : window.event
        self.stopBubble(thee)
      }
      self.canvas.onmousemove = function (e) {
        let x2 = e.clientX
        let y2 = e.clientY
        x2 -= rect.left
        y2 -= rect.top
        let newPoint = { x: x2 * scaleX, y: y2 * scaleY }

        if (self.isPainting()) {
          self.drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
          lastPoint = newPoint
        } else if (self.paintTypeArr["erase"]) {
          if(!lastPoint.x && !lastPoint.y){return}
          self.handleErase(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
          lastPoint = newPoint
        } else if (self.paintTypeArr["line"]) {
          self.clearCanvas()
          self.imageData && self.context.putImageData(self.imageData, 0, 0)
          self.drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
        } else if (self.paintTypeArr["arrows"]) {
          self.clearCanvas()
          self.imageData && self.context.putImageData(self.imageData, 0, 0)
          self.drawArrow(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
        } else if (self.paintTypeArr["rect"]) {
          self.clearCanvas()
          self.imageData && self.context.putImageData(self.imageData, 0, 0)
          self.drawRect(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
        } else if (self.paintTypeArr["circle"]) {
          self.clearCanvas()
          self.imageData && self.context.putImageData(self.imageData, 0, 0)
          self.drawCircle(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
        }

        var thee = e ? e : window.event
        self.stopBubble(thee)
      }
      self.canvas.onmouseup = function () {
        lastPoint = { x: undefined, y: undefined }
        self.canvasDraw()
        console.log(123)
        self.filterObject()
      }
    },


    //更新绘画类型数组paintTypeArr的状态
    filterObject(type) {
      if (!type) {
        for (const key in this.paintTypeArr) {
          this.paintTypeArr[key] = false
        }
      } else {
        for (const key in this.paintTypeArr) {
          key === type
            ? (this.paintTypeArr[key] = true)
            : (this.paintTypeArr[key] = false)
        }
      }
    },
    //阻止事件冒泡
    stopBubble(evt) {
      if (evt.stopPropagation) {
        evt.stopPropagation()
      } else {
        //ie
        evt.cancelBubble = true
      }
    },
    //判断是否是自由绘画模式
    isPainting() {
      for (let key in this.paintTypeArr) {
        if (key !== "painting" && this.paintTypeArr[key]) {
          return false
        }
      }
      if (this.paintTypeArr["painting"]) {
        return true
      }
      return false
    },
    handleErase(x1, y1, x2, y2) {
      let ctx = this.context
      //获取两个点之间的剪辑区域四个端点
      var asin = radius * Math.sin(Math.atan((y2 - y1) / (x2 - x1)))
      var acos = radius * Math.cos(Math.atan((y2 - y1) / (x2 - x1)))
      var x3 = x1 + asin
      var y3 = y1 - acos
      var x4 = x1 - asin
      var y4 = y1 + acos
      var x5 = x2 + asin
      var y5 = y2 - acos
      var x6 = x2 - asin
      var y6 = y2 + acos   //保证线条的连贯，所以在矩形一端画圆

      ctx.save()
      ctx.beginPath()
      ctx.globalCompositeOperation = "destination-out"
      let radius = this.lWidth / 2 > 5 ? this.lWidth / 2 : 5
      ctx.arc(x2, y2, radius, 0, 2 * Math.PI)
      ctx.clip()
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      ctx.restore()   //清除矩形剪辑区域里的像素

      ctx.save()
      ctx.beginPath()
      ctx.globalCompositeOperation = "destination-out"
      ctx.moveTo(x3, y3)
      ctx.lineTo(x5, y5)
      ctx.lineTo(x6, y6)
      ctx.lineTo(x4, y4)
      ctx.closePath()
      ctx.clip()
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      ctx.restore()
    },
    drawLine(fromX, fromY, toX, toY) {
      let ctx = this.context
      ctx.beginPath()
      ctx.lineWidth = this.lwidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()
      ctx.closePath()
    },
    drawArrow(fromX, fromY, toX, toY) {
      let ctx = this.context
      var headlen = 10   //自定义箭头线的长度
      var theta = 45   //自定义箭头线与直线的夹角，个人觉得45°刚刚好
      var arrowX, arrowY   //箭头线终点坐标
      // 计算各角度和对应的箭头终点坐标
      var angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI
      var angle1 = ((angle + theta) * Math.PI) / 180
      var angle2 = ((angle - theta) * Math.PI) / 180
      var topX = headlen * Math.cos(angle1)
      var topY = headlen * Math.sin(angle1)
      var botX = headlen * Math.cos(angle2)
      var botY = headlen * Math.sin(angle2)
      ctx.beginPath()
      //画直线
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)

      arrowX = toX + topX
      arrowY = toY + topY
      //画上边箭头线
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(toX, toY)

      arrowX = toX + botX
      arrowY = toY + botY
      //画下边箭头线
      ctx.lineTo(arrowX, arrowY)

      ctx.stroke()
      ctx.closePath()
    },

    drawRect(topLeftX, topLeftY, botRightX, botRightY) {
      let ctx = this.context
      ctx.strokeRect(
        topLeftX,
        topLeftY,
        Math.abs(botRightX - topLeftX),
        Math.abs(botRightY - topLeftY)
      )
    },
    //画圆
    drawCircle(circleX, circleY, endX, endY) {
      let ctx = this.context
      let radius = Math.sqrt(
        (circleX - endX) * (circleX - endX) +
        (circleY - endY) * (circleY - endY)
      )
      ctx.beginPath()
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2, true)
      ctx.stroke()
    },
    drawText(startX, startY, content) {
      let ctx = this.context
      ctx.save()
      ctx.beginPath()
      ctx.font = "25px orbitron"
      ctx.textBaseline = "top"
      ctx.fillText(content, parseInt(startX), parseInt(startY))
      ctx.restore()
      ctx.closePath()
    },
    //清屏
    clearCanvas() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    //定格画布图片
    canvasDraw() {
      this.imageData = this.context.getImageData(0,0,this.canvas.width,this.canvas.height)
      this.historyImageData.push(this.imageData)
      console.log(this.historyImageData)
    },

    //撤销
    redo(){
      let historyImageData = this.historyImageData
      let newHistoryImageData = this.newHistoryImageData
      if(historyImageData.length > 0){
        let hisImg = historyImageData.pop()
        newHistoryImageData.push(hisImg)
        if(historyImageData.length === 0){
          this.imageData = null
          this.clearCanvas()
        }else{
          this.context.putImageData(historyImageData[historyImageData.length - 1],0,0)
        }
      }
    },
    //反撤销
    cancelRedo(){
      if(this.newHistoryImageData.length > 0){
        const newHisImg = this.newHistoryImageData.pop()
        this.imageData = newHisImg
        this.context.putImageData(newHisImg,0,0)
        this.historyImageData.push(newHisImg)
      }
    },
    //保存图片
    downLoad(){
      const imgUrl = this.canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = imgUrl
      a.download = '绘图保存记录' + (new Date).getTime()
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
    },
    getParams(){
      const routerParams=this.$route.query.id;
      const picParams=this.$route.query.picBase;
      this.picId=routerParams;
      this.picBase=picParams;
      // console.log(this.picBase);
      console.log(routerParams);
    },
    clickFunc() {
      this.$refs.file.click();
    },
    drawPic(){
      let that=this;
      console.log(this.picId)
      axios.get('http://localhost:90/pic/show/'+this.picId)
      .then(function (response){
        let result=response.data;
        if (result.status==0){
          that.info=result.data;
          console.log(that.info)
          that.Image=new Image();
          that.Image.src=that.info.picBase;
          that.IW=500;
          that.IH=500;
          that.drawImage();
        }

      })
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
      this.CTX.clearRect(this.IL,this.IT,this.IW,this.IH);
      this.CTX.drawImage(this.Image,this.IL,this.IT,this.IW,this.IH);
    },
    grey(){
      let canvas=document.querySelector('canvas')
      let CTX=canvas.getContext("2d")
      let imageData = CTX.getImageData(0, 0, this.IW, this.IH);
      this.cxtb=this.$refs.canvasB.getContext('2d');
      this.cxtb.clearRect(0,0,500,500);
      let pixelData = imageData.data;
      for (var i = 0; i < this.IW*this.IH; i++) {
        var r = pixelData[i*4+0]
        var g = pixelData[i*4+1]
        var b = pixelData[i*4+2]

        var grey = r*0.3+g*0.59+b*0.11//图片灰度值

        pixelData[i*4+0] = grey
        pixelData[i*4+1] = grey
        pixelData[i*4+2] = grey
      }
      this.cxtb.putImageData(imageData,0, 0, 0, 0, this.IW, this.IH)

    },
    black(){
      let canvas=document.querySelector('canvas')
      let CTX=canvas.getContext("2d")
      let imageData = CTX.getImageData(0, 0, this.IW, this.IH);
      this.cxtb=this.$refs.canvasB.getContext('2d');
      this.cxtb.clearRect(0,0,500,500);
      let pixelData = imageData.data;
      for (var i = 0; i < this.IW*this.IH; i++) {
        var r = pixelData[i*4+0]
        var g = pixelData[i*4+1]
        var b = pixelData[i*4+2]

        var grey = r*0.3+g*0.59+b*0.11//图片灰度值


        let v;
        if (grey>255/2){
          v=255
        }

        else {
          v=0
        }

        pixelData[i*4+0] = grey
        pixelData[i*4+1] = grey
        pixelData[i*4+2] = grey

      }
      this.cxtb.putImageData(imageData,0, 0, 0, 0, this.IW, this.IH)

    },
    reverse(){
      let canvas=document.querySelector('canvas')
      let CTX=canvas.getContext("2d")
      let imageData = CTX.getImageData(0, 0, this.IW, this.IH);
      this.cxtb=this.$refs.canvasB.getContext('2d');
      this.cxtb.clearRect(0,0,500,500);
      let pixelData = imageData.data;
      for (var i = 0; i < this.IW*this.IH; i++) {
        var r = pixelData[i*4+0]
        var g = pixelData[i*4+1]
        var b = pixelData[i*4+2]

        pixelData[i*4+0] = 255-r
        pixelData[i*4+1] = 255-g
        pixelData[i*4+2] = 255-b
      }
      this.cxtb.putImageData(imageData,0, 0, 0, 0, this.IW, this.IH)
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

    },
    translation(){
      let that=this
      let canvas=document.querySelector('canvas')
      let CTX=canvas.getContext("2d")
      canvas.onmousedown = function (e) {
        // console.log(that.x)
        let x = that.IL - e.offsetX;
        let y = that.IT - e.offsetY;
        //按下后可移动
        canvas.onmousemove = function (e) {
          CTX.clearRect(that.IL,that.IT,500,500);
          that.IL = x + e.offsetX;
          that.IT = y + e.offsetY;
          that.drawImage()
          console.log(that.IL);
        };

        //鼠标抬起清除绑定事件
        canvas.onmouseleave = function () {
          canvas.onmousemove = null;
          canvas.onmouseup = null;
          canvas.onmouseleave = null;
        };
        canvas.onmouseup = function () {
          canvas.onmousemove = null;
          canvas.onmouseup = null;
          canvas.onmouseleave = null;
        };
      }

    },
    Rotate(){
      let c_x,c_y; //相对于canvas坐标的位置；
      let isMouseDown=false;
      let that=this;
      let canvas=document.querySelector('canvas')
      let ctx=canvas.getContext('2d');
      canvas.addEventListener('mousedown',e => {
        isMouseDown=true;
      },false)
      canvas.addEventListener('mousemove',e=> {
        if(isMouseDown==true){
          ctx.clearRect(that.IL,that.IT,500,500);
          c_x=getPos(e).x-canvas.offsetLeft;
          c_y=getPos(e).y-canvas.offsetTop;
          //setInterval(drawFram,1000/60)

          requestAnimationFrame(drawFram)
        }
      },false)
      canvas.addEventListener('mouseup',e => {
        isMouseDown=false;
      },false)
      function drawFram(){
        // console.log(that.IL)
        let dx=c_x-that.IL;
        let dy=c_y-that.IT;
        that.rolation=Math.atan2(dy,dx);
        console.log(that.CTX)
        that.CTX.translate(250,250)
        that.CTX.clearRect(that.IL,that.IT,canvas.width,canvas.height);
        that.CTX.rotate(that.rolation/60)
        that.CTX.translate(-250,-250)
        that.drawImage()
      }
      function getPos(e) {
        let mouse={x:0,y:0}
        var e=e||event;

        if(e.pageX||e.pageY){
          mouse.x=e.pageX;
          mouse.y=e.pageY;
        }else{
          mouse.x=e.pageX+document.body.scrollLeft+document.document.documentElement.scrollLeft;
          mouse.y=e.pageY+document.body.scrollTop+document.document.documentElement.scrollTop;
        }
        return mouse;
      }
    },
    scrawl(){
      var canvas = document.getElementById('canvas');
      var ctx = canvas.getContext('2d');

      canvas.onmousedown = function(ev){
        var x = ev.clientX - this.offsetLeft;
        var y = ev.clientY - this.offsetTop;
        ctx.beginPath();
        ctx.moveTo(x,y);
        canvas.onmousemove = function(ev){
          var targetX = ev.clientX - this.offsetLeft;
          var targetY = ev.clientY - this.offsetTop;

          ctx.lineWidth = 1;
          ctx.lineTo(targetX,targetY);
          ctx.stroke();
        };
        window.onmouseup = function(ev){
          canvas.onmousemove = null;
          canvas.onmouseup = null;
        };
      };
    },

  }
}
</script>

<style lang="less" scoped>
.el-container {
  width: 100%;
  height: 100%;
  margin: 10px auto;
  overflow: hidden;
}
.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
.clipImageBox .buttonBox .file{
  display: none;
}
.clipImageBox .buttonBox{
  margin-top: auto;
}
.clipImageBox .buttonBox el-button{
  background: lightblue;
}
.tool-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  border: 2px solid orange;
  border-radius: 10px;
  display: flex;
  justify-content: center;
}
.drawPane {
  padding: 25px 20px;
  height: 120px;
  position: absolute;
  top: -120px;
  left: 0px;
  border-radius: 5px;
  border: 2px solid orangered;
}
.close-draw-pane {
  position: absolute;
  right: 5px;
  top: 5px;
}
.icon-div {
  margin: 10px 12px;
}
.icon :hover {
  cursor: pointer;
}
input[type="range"] {
  -webkit-appearance: none;
  width: 180px;
  height: 24px;
  outline: none;
  margin-bottom: 3px;
}
input[type="range"]::-webkit-slider-runnable-track {
  background-color: orangered;
  height: 4px;
  border-radius: 5px;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: orange;
  cursor: pointer;
  margin-top: -4px;
}
.text-style {
  float: left;
  position: absolute;
  font: 25px orbitron;
  word-break: break-all;
  background-color: transparent;
}

</style>
