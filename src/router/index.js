import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import App from "../App";
import image from "../views/image";
import home from "../components/home";
import first from "../components/first";
// import image from "../image";
// import image from "../components/image";
// import image from "../views/image";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: home,
    },
    {
      path:'/',
      component:home
    },
  {
    path:'/first',
    name:'first',
    component:first
  }

  ]
})
