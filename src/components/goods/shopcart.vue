<template>
   <div>
       <div class="section">
            <div class="location">
                <span>当前位置：</span>
                <a href="/index.html">首页</a> &gt;
                <a href="/cart.html">购物车</a>
            </div>
        </div>

        <div class="section">
            <div class="wrapper">
                <div class="bg-wrap">
                    <!--购物车头部-->
                    <div class="cart-head clearfix">
                        <h2>
                            <i class="iconfont icon-cart"></i>我的购物车</h2>
                        <div class="cart-setp">
                            <ul>
                                <li class="first active">
                                    <div class="progress">
                                        <span>1</span>
                                        放进购物车
                                    </div>
                                </li>
                                <li>
                                    <div class="progress">
                                        <span>2</span>
                                        填写订单信息
                                    </div>
                                </li>
                                <li class="last">
                                    <div class="progress">
                                        <span>3</span>
                                        支付/确认订单
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <!--购物车头部-->
                    <!--商品列表-->
                    <div class="cart-box">
                        <input id="jsondata" name="jsondata" type="hidden">
                        <table width="100%" align="center" class="cart-table" border="0" cellspacing="0" cellpadding="8">
                            <tbody>
                                <tr>
                                    <th width="48" align="center">
                                        <a>选择</a>
                                    </th>
                                    <th align="left" colspan="2">商品信息</th>
                                    <th width="84" align="left">单价</th>
                                    <th width="104" align="center">数量</th>
                                    <th width="104" align="left">金额(元)</th>
                                    <th width="54" align="center">操作</th>
                                </tr>
                                <!-- 购物车空 -->
                                <tr v-if="goodsList.length == 0">
                                    <td colspan="10">
                                        <div class="msg-tips">
                                            <div class="icon warning">
                                                <i class="iconfont icon-tip"></i>
                                            </div>
                                            <div class="info">
                                                <strong>购物车没有商品！</strong>
                                                <p>您的购物车为空，
                                                    <a href="/index.html">马上去购物</a>吧！</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <!--  -->
                                <tr v-for="(item,index) in goodsList" :key="item.id">
                                    <td width="48" align="center">
                                            <el-switch
                                                v-model="item.isSelected"
                                                active-color="#409eff"
                                                inactive-color="#555555">
                                          </el-switch>
                                    </td>
                                    <td align="left" colspan="2">
                                        <div class="shopInfo">
                                            <img style="width:50px;height:50px;margin-right: 10px;" :src="item.img_url" alt="">
                                            <span>{{item.title}}</span>
                                        </div>
                                    </td>
                                    <td width="84" align="left">{{item.sell_price}}</td>
                                    <td width="104" align="center">
                                        <subinput :initCount="item.buycount" :goodsId="item.id" @numberChange="getChangeGoods"></subinput></td>
                                    <td width="104" align="left">{{item.sell_price * item.buycount}}</td>
                                    <td width="54" align="center">
                                        <a @click="deleteGoods(index,item.id)" href="javascript:void(0)">删除</a>
                                    </td>
                                </tr>
                                <tr>
                                    <th align="right" colspan="8">
                                        已选择商品
                                        <b class="red" id="totalQuantity">{{getTotalCount}}</b> 件 &nbsp;&nbsp;&nbsp; 商品总金额（不含运费）：
                                        <span class="red">￥</span>
                                        <b class="red" id="totalAmount">{{getTotalAmount}}</b>元
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--/商品列表-->
                    <!--购物车底部-->
                    <div class="cart-foot clearfix">
                        <div class="right-box">
                            <button @click="continueBuy" class="button">继续购物</button>
                           
                            <button class="submit" @click="submitOrder" >立即结算</button>
                        </div>
                    </div>
                    <!--购物车底部-->
                </div>
            </div>
        </div>
   </div>
</template>
<style scoped>
    .shopInfo {
        display: flex;
        align-items: center;
    }
</style>

<script>
import {getLocalGoods} from "../../common/localStorageHelper.js";
import subinput from "../../components/subcomponent/subinput";
    export default {
        components:{
            subinput
        },
        data(){
            return {
                goodsList:[]
            }
        },
        created(){
            this.getGoodsListData()
        },
        computed:{
            // 计算总数量
            getTotalCount(){
                let totalCount = 0
                this.goodsList.forEach(element => {
                    if(element.isSelected){

                        totalCount += element.buycount
                    }
                });
                return totalCount
            },
            // 计算总金额
            getTotalAmount(){
                let totalAmount = 0
                this.goodsList.forEach(element => {
                    if(element.isSelected){

                        totalAmount += element.buycount * element.sell_price
                    }
                }); 
                return totalAmount 
            }
        },
        methods:{
            getGoodsListData() {
                //1.调用Vuex的getters的getLocalGoods方法
                const localGoods = getLocalGoods()

                if (Object.keys(localGoods).length === 0) return


                //2.准备url
                const url = `site/comment/getshopcargoods/${Object.keys(localGoods).join(',')}`

                //3.发送请求，获取数据
                this.axios.get(url).then(res => {
                    res.data.message.forEach(goods => {
                        goods.buycount = localGoods[goods.id]
                        goods.isSelected = true
                    })

                    this.goodsList = res.data.message
                })
            },
             getChangeGoods(changeGoods) {
                //1.更改goodsList数组中和changeGoods中id一样的商品的数量
                this.goodsList.forEach(goods => {
                    if (goods.id === changeGoods.goodsId) {
                        goods.buycount = changeGoods.count
                    }
                })

                //2.调用Vuex中Mutations修改的方法，传递载荷
                this.$store.commit('updateGoods', changeGoods)
            },
            deleteGoods(index,goodsId){
                this.$confirm('确定要删除该商品吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {//确认
                    //1.根据索引，删除goodsList的数据
                    this.goodsList.splice(index,1)

                    //2.调用Vuex中mutation的删除方法，把goodsId当作载荷传递过去
                    this.$store.commit('deleteGoodsById',goodsId)
                }).catch(() => {//取消
                    
                });
            },
             //继续购物
            continueBuy(){
                // this.$router.push('goodslist')
                this.$router.push({ path: 'goodslist' })
            },
            submitOrder(){
                const tempArray = []

                this.goodsList.forEach(goods=>{
                    if(goods.isSelected){
                        tempArray.push(goods.id)
                    }
                })

                if(tempArray.length === 0) {
                    this.$message({
                        showClose: true,
                        message: '至少要选择一条商品进行下单操作！',
                        type: 'warning'
                    });
                    return
                }

                this.$router.push({ path: 'order', query: { ids: tempArray.join(',') }})
            }
        }
    }
</script>
