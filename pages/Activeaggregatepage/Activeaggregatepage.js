var app = getApp();
var util = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgInfo: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    activityStatus: 1,
    activityList:[],
    scrollTop: 0,
    isShowLoading: false,//是否显示加载更多 
    pullLoading: false,//转圈的图片
    loadingText: '上拉显示更多',
  },
  requestData: {
    type:1,
    status: 1,
    pageIndex: 1,
    pageSize:5
  },
  isloadingData: false,
  interfaceOkCount: 0,
  isPullLoading: false,
  timer:null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      copyright: {
        logoSrc: wx.getStorageSync("copyRightLogo"),
        isOpenCopyRight: wx.getStorageSync("isOpenCopyRight"),
        copyRightText: wx.getStorageSync("copyRightText")
      },
      isClose: wx.getStorageSync("isClose")      
    })
    if(options.type){
      this.requestData.type = options.type;
    }
    var that = this;
  },
  getuserinfo: function () {
      this.bindData(this.requestData.status);
      this.setData({
          showAuthorization: false
      })
  },
  changeNav: function (e) {//选项卡点击
    var that = this;    
    var clickNavStatus = e.target.dataset.status;
    if (that.requestData.status == clickNavStatus) {//如果是点击的是当前的
      return false;      
    } else {//如果点击不是当前的      
      that.requestData.status = clickNavStatus;//查询字段设置成点击的项
      that.setData({
        loadComplete: false,
        isShowLoading: false,
        scrollTop: 0,
        activityStatus: clickNavStatus
      });
      that.data.pullLoading = true;
      that.setData({
        loadingText: ''
      })
      that.requestData.pageIndex = 1;//重置到第一页
      that.bindData(that.requestData.status);//重新加载数据
    }    
  },  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      var shopInfo = wx.getStorageSync('shopInfo');
      if (shopInfo && shopInfo.SiteName) {
          wx.setNavigationBarTitle({
              title: shopInfo.SiteName,
          });
      }
      if (wx.getStorageSync('isLogin')) {
          if (this.data.showAuthorization) {
              this.setData({
                  showAuthorization: false
              })
          }
          this.bindData(this.requestData.status);
      } else {
          app.getUserInfo(() => {
              this.setData({
                  showAuthorization: true
              })
          }, () => {
              this.bindData(this.requestData.status);
          })
      }
  },  
  pullLoadingData: function () {
    var that = this;
    if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
      that.isPullLoading = true;
      that.requestData.pageIndex++;
      that.setData({
        loadingText: '正在加载更多商品~'
      });
      setTimeout(function () {
        //只有不是查指定商品的时候下拉才加载
          that.bindData(that.requestData.status, 'pull');        
      }, 1000)
    }
  },
  bindData: function (navIndex, pull) {//请求绑定数据
    var that = this;
    that.requestData.status = navIndex;
    /*正式数据勿删 */
    app.request({
      url: '/activityindex/getlist', 
      requestDomain: 'ymf_domain',
      data: that.requestData,
      success: function (res) {
        that.autoUpdatetimer && clearInterval(that.autoUpdatetimer);
        if (res.Code == 0) {
          if (pull) {//上拉的
            var data = res.Data;
            data.PageData.forEach(function (item) {
              item.ProductOldPrice = item.ProductOldPrice.toFixed(2);
              item.SalePrice = item.SalePrice.toFixed(2);
              item.ActivityType = that.requestData.type;
            })
            that.data.activityList = that.data.activityList.concat(data.PageData);
            that.setData({
              activityList: that.data.activityList
            });
          } else {//切换页签或首次加载的
            var data=res.Data;
            data.PageData.forEach(function (item) {
              item.ProductOldPrice = item.ProductOldPrice.toFixed(2);
              item.SalePrice = item.SalePrice.toFixed(2);
              item.ActivityType = that.requestData.type;
            })
            that.setData({
              activityList: data.PageData
            })
          }
          if (res.Data.Total <= that.data.activityList.length) {//处理显示加载更多
            that.setData({
              pullLoading: false,
              loadingText: '没有更多数据了'
            })
          } else {
            that.setData({
              pullLoading: true,
              isShowLoading: true
            })
          }
          // that.data.copyright.position = that.data.activityList.length > 2 ? '' : 'copyright-fixed';
          that.setData({
            loadComplete: true,
            copyright: that.data.copyright
          })
          that.isPullLoading = false;
        }
        that.timer=setInterval(function () {
          that.data.activityList.forEach(function (item) {
            if (that.data.activityStatus==1){
              item.endDate = util.timeDifference(util.formatDateTime(item.ActivityEnd));
            }else{
              item.endDate = util.timeDifference(util.formatDateTime(item.ActivityStar));
            }
          })
          that.setData({
            activityList: that.data.activityList
          })
        }, 1000)
        that.autoUpdatetimer = setInterval(function () {
          var now = new Date().getTime();
          that.data.activityList.forEach(function (item, index) {
            if (that.data.activityStatus == 1) {
              if (now > item.ActivityEnd.substring(6, item.ActivityEnd.length - 2)) {
                that.data.activityList.splice(index, 1);
              }
            } else {
              if (now > item.ActivityStar.substring(6, item.ActivityStar.length - 2)) {
                that.data.activityList.splice(index, 1);
              }
            }
          })
          that.setData({
            activityList: that.data.activityList
          })
        }, 1000)
      },
      fail: function (res) {
      }
    });
  },
  onHide(){
      clearInterval(this.timer);
  },
  onUnload(){
      clearInterval(this.timer);
  },
  onShareAppMessage: function () {
    var that = this;
    var siteName = wx.getStorageSync('shopInfo');
    siteName = siteName ? siteName.SiteName : '活动专题';
    var shopId = wx.getStorageSync('shopId');
    return {
      title: siteName,
      path: '/pages/pintuan/index/index?shopId=' + shopId,
      success: function (res) {
        console.log('转发成功，shopId:' + shopId);
        // 转发成功
      },
      fail: function (res) {
        console.log('转发失败，shopId:' + shopId)
        // 转发失败
      }
    }
  },
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  }
})