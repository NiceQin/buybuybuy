import Vue from 'vue'
import VueRouter from "vue-router";
import ElementUI from "element-ui";
import axios from "axios";
import VueLazyload from "vue-lazyload";
import moment from "moment";
const path = require("path");
import Vuex from "vuex";

//使用基于Vue的中间件
Vue.use(VueRouter) //Vue.prototype.$route Vue.prototype.$router
Vue.use(ElementUI)
Vue.use(VueLazyload, {
  loading: path.join(__dirname, "src/statics/site/images/01.gif")
});
Vue.use(Vuex);

axios.defaults.baseURL = "http://47.106.148.205:8899/" //设置axios的基路径
Vue.prototype.axios = axios
axios.defaults.withCredentials = true //允许携带cookie

import App from "./App.vue";
//注册组件
import goodslist from './components/goods/goodslist.vue'
import goodsinfo from './components/goods/goodsinfo.vue'
import login from './components/goods/login.vue'
import shopcart from "./components/goods/shopcart.vue";
import order from './components/goods/order.vue'

// vuex
import {
  addLocalGoods,
  getTotalCount,
  updateLocalGoods,
  deleteLocalGoodsById
} from "./common/localStorageHelper";

const store = new Vuex.Store({
  state: {
    buyCount: getTotalCount()
  },
  getters: {
    getBuyCount(state) {
      return state.buyCount;
    },
    getLocalGoods(state) {
      return getLocalGoods();
    }
  },
  mutations: {
    addGoods(state, goods) {
      state.buyCount = addLocalGoods(goods);
    },
    updateGoods(state, goods) {
      state.buyCount = updateLocalGoods(goods);
    },
    deleteGoodsById(state, goodsId) {
      state.buyCount = deleteLocalGoodsById(goodsId);
    }
  }
});

//导入全局需要用到的样式
import 'element-ui/lib/theme-chalk/index.css'
import './statics/site/css/style.css'


const router = new VueRouter({
  routes: [
    { path: "/", redirect: "/goodslist" },
    { path: "/goodslist", component: goodslist },
    { path: "/shopcart", component: shopcart },
    { path: "/goodsinfo/:goodsid", component: goodsinfo },
    { path: "/login", component: login },
    { path: "/order", component: order, meta: { needLogin: true } }
  ]
});

// 导航守卫
router.beforeEach((to,from,next)=>{
    if (to.fullPath != '/login') {
     
        localStorage.setItem('toVisited',to.fullPath)
    }
    if (to.meta.needLogin) {
        axios.get(`site/account/islogin`).then(res=>{
            if (res.data.code == 'nologin') {
              console.log('失败');
              
              router.push('login')
            }else{
              next()
            }
        })
    }else{

      next()  
    }
})

Vue.filter('dateFmt',(input,formatStr="YYYY-MM-DD")=>{
    //第二个参数的 formatStr="YYYY-MM-DD" 相当于下面这样写
    //const lastFormatStr = formatStr || "YYYY-MM-DD"

    /**
     * 第一个参数:要过滤的原始的时间字符串
     * 第二个参数：要格式化成的字符串
     */
    return moment(input).format(formatStr)
})


new Vue({
  el: "#app",
  render: h => h(App),
  router,
  store
});