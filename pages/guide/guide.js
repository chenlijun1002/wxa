// pages/guide/guide.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //处理临时的二维码扫码跳转页面功能（蒯伟）
      var sscene = decodeURIComponent(options.scene);//"vw_p_coupon-12"; 
      var title="";       
      var topage = "";
      switch (sscene.split('-')[0]){
          case "vw_p_pd"://商品详细页（"vw_p_pd-"+id）
              topage = "/pages/detail/detail?productId=" + sscene.substring(8);
              break;
          case "vw_p_coupon"://我的优惠券页面（"vw_p_coupon-"+id）
              topage = "/pages/mycoupon/mycoupon?t=" + sscene.substring(12);
              break;
          case "vw_p_ptuan"://拼团
              topage = "/pages/pintuan/detail/detail?activityId=" + sscene.substring(11);
              break;
          case "vw_p_seckil"://秒杀二维码
              topage = "/pages/seckilling/seckillingDetail/seckillingDetail?activityId=" + sscene.substring(12);
              break;
          case "vw_p_reduct"://降价拍
              topage = "/pages/reduceauction/reduceauctiondetail/reduceauctiondetail?activityId=" + sscene.substring(12);
              break;
          case "vw_p_strgrp"://返现团
              topage = "/pages/stairgroup/activitydetail/activitydetail?activityId=" + sscene.substring(12);
              break;
          case "vw_p_micropage"://微页面
          title="微页面";
          if (sscene.split("-")[2]==1){
            topage = "/pages/index/index";
          }else{
            //topage = "/pages/custom/custom?id=" + sscene.substring(15);
            topage = "/pages/custom/custom?id=" + sscene.split("-")[1];
          }            
            break;
          case "vw_p_couponDetail"://优惠券详情
          topage = "/pages/couponcenter/couponcenter?CouponId=" + sscene.substring(18);
            break;
          default:
              break;
      }
      if (topage != "") {
          app.navigateTo(topage, 'redirectTo');
      }else{
        this.setData({ tscene:options.scene,title:title})
        app.navigateTo('/pages/error/error?errorStatus=404', 'navigateTo');
      }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})