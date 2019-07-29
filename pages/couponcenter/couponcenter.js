// pages/couponcenter/couponcenter.js
var util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadComplete: false,
    isCouponDetail:false,
    UnfinishedCounponList: [],
    StolenCouponList:[],
    CouponId:0   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.CouponId){
      this.setData({
        isCouponDetail:true,
        CouponId: options.CouponId
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initData();
  },
  initData:function(){
    let that=this;      
    if(this.data.isCouponDetail){
      wx.setNavigationBarTitle({
        title: '优惠券详情'
      })      
      app.request({
        url: "/Coupon/GetCouponDetail",
        data: { CouponId: that.data.CouponId},
        success: function (res) {
          if (res.Code == 0 ){
            let list=[];  
            let endDate = res.Data.EndDate;       
            res.Data.EndDate = res.Data.EndDate.substr(0, 10).replace(/[\-]/g, '.');
            res.Data.BeginDate = res.Data.BeginDate.substr(0, 10).replace(/[\-]/g, '.');
            list.push(res.Data);                      
            that.setData({
              UnfinishedCounponList: list,
              loadComplete: true
            })     
            that.timer = setInterval(function () {
              var now = new Date().getTime();
              if (now > new Date(endDate.replace(/[T]/g, ' ').replace(/[-]/g, '/')).getTime()) {
                that.data.UnfinishedCounponList[0].Status=1;
                that.setData({
                  UnfinishedCounponList: that.data.UnfinishedCounponList
                })
              }
            }, 1000)        
          }else if(res.Code==1){
            wx.showToast({
              title: '该优惠券不存在！',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: function (res) {

        },
        complete: function () {

        }
      })     
    }else{
      app.request({
        url: "/Coupon/GetCouponList",
        data: {},
        success: function (res) {
          that.timer && clearInterval(that.timer);
          if (res.Code == 0) {
            res.Data.UnfinishedBusinessCounponList.forEach(function(item){
              item.end = item.EndDate;
              item.EndDate = item.EndDate.substr(0,10).replace(/[\-]/g,'.');
              item.BeginDate = item.BeginDate.substr(0, 10).replace(/[\-]/g, '.');            
            }) 
            res.Data.StolenCouponList.forEach(function (item) {
              item.end = item.EndDate;
              item.EndDate = item.EndDate.substr(0, 10).replace(/[\-]/g, '.');
              item.BeginDate = item.BeginDate.substr(0, 10).replace(/[\-]/g, '.');
            })           
            that.setData({
               UnfinishedCounponList: res.Data.UnfinishedBusinessCounponList,
               StolenCouponList: res.Data.StolenCouponList,
               loadComplete: true
            })
            that.timer = setInterval(function () {
              var now = new Date().getTime();
              that.data.UnfinishedCounponList.forEach(function (item, index) {
                if (now > new Date(item.end.replace(/[T]/g, ' ').replace(/[-]/g, '/')).getTime()) {
                  that.data.UnfinishedCounponList.splice(index, 1);
                  that.setData({
                    UnfinishedCounponList: that.data.UnfinishedCounponList
                  })
                }
              })
            }, 1000)
          }
        },
        fail: function (res) {

        },
        complete: function () {
          
        }
      })
    }
  },
  receiveRequest: function (e) { 
    let that=this;
    let status = e.target.dataset.status; 
    let CouponId = e.target.dataset.id;
    let index = e.target.dataset.index; 
    let productIds = e.target.dataset.productids; 
    if (this.data.isCouponDetail){      
      if (status == 0) {
        app.request({
          url: "/Coupon/ReceiveCoupon",
          data: { CouponId: CouponId},
          success: function (res) {
            if(res.Code==0){
              wx.showToast({
                title: '领取成功！',
                duration: 2000
              });
              const UnfinishedCounponList = that.data.UnfinishedCounponList;
              UnfinishedCounponList[index].Status=2;
              that.setData({
                UnfinishedCounponList: UnfinishedCounponList
              })
            } else if (res.Code == 1) {             
              wx.showToast({
                title: '该优惠券已抢光！',
                icon:'none',
                duration: 2000
              });
              that.initData();
            } else if (res.Code == 2) {              
              wx.showToast({
                title: '超过领取张数限制！',
                icon: 'none',
                duration: 2000
              });
              that.initData();
            } 
            else if (res.Code == 3) {
              wx.showToast({
                title: '您不符合领取条件！',
                icon: 'none',
                duration: 2000
              });
              that.initData();
            }
            else {              
              wx.showToast({
                title: '领取失败！',
                icon: 'none',
                duration: 2000
              });
            }
          },
          fail: function (res) {
            wx.showToast({
              title: '领取失败！',
              icon: 'none',
              duration: 2000
            });
          },
          complete: function () {

          }
        })
      }else if(status==1||status==3){
        return;
      } else {
        var productId = productIds?productIds.join(","):'';
        app.navigateTo('/pages/productlist/productlist?appointId=' + productId, 'navigateTo');
      }
    }else{
      if (status == 1){
        app.request({
          url: "/Coupon/ReceiveCoupon",
          data: { CouponId: CouponId},
          success: function (res) {
            if (res.Code == 0) {             
              wx.showToast({
                title: '领取成功！',
                duration: 2000
              });
              const UnfinishedCounponList = that.data.UnfinishedCounponList;
              UnfinishedCounponList[index].ReceiveStatus = 2;
              that.setData({
                UnfinishedCounponList: UnfinishedCounponList
              })
            } else if (res.Code == 1){
              //0：领取成功，1：已抢光，2：超过领取张数限制              
              wx.showToast({
                title: '该优惠券已抢光！',
                icon: 'none',
                duration: 2000
              });
              that.initData();
            } else if (res.Code == 2){              
              wx.showToast({
                title: '超过领取张数限制！',
                icon: 'none',
                duration: 2000
              });
              that.initData();
            }
            else if (res.Code == 3) {
              wx.showToast({
                title: '您不符合领取条件！',
                icon: 'none',
                duration: 2000
              });
              that.initData();
            }
            else{              
              wx.showToast({
                title: '领取失败！',
                icon: 'none',
                duration: 2000
              });
            }
          },
          fail: function (res) {
            wx.showToast({
              title: '领取失败！',
              icon: 'none',
              duration: 2000
            });
          },
          complete: function () {

          }
        })
      } else {
        var  productId = productIds ? productIds.join(",") : '';
        app.navigateTo('/pages/productlist/productlist?appointId=' + productId, 'navigateTo');
      }
    }
  },
  goIndex(){
    app.navigateTo('/pages/index/index', 'navigateTo');
  },
  goCouponCenter(){
    app.navigateTo('/pages/couponcenter/couponcenter', 'navigateTo');
  }
})