//余额记录
const app = getApp();
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadComplete: false,
    pageType: 0,
    pageIndex: 1,
    pageSize: 10,
    amountList: [],
    pullLoading: false,
    loadingText: '上拉显示更多',
    isShowLoading: false,
    scrollTop: 0,
    isShowToast: false,
    toastText: {}
  },
  isPullLoading: false,
  sendFormId: function (e) {
      app.sendFormId(e.detail.formId, 0);
  },
  getAmountList(pull, initial) {
    const that = this;
    app.request({
      url: '/Member/GetDepositRecord',
      data: {
        pageIndex: that.data.pageIndex,
        pageSize: that.data.pageSize,
        type: that.data.pageType
      },
      success(res) {
        if (res.Code === 0) {
          let list = res.Data.Data;
          list.forEach(function(item,index){
            item.AmountStr=item.Amount.toFixed(2);
            if(item.IsCheck==-1 || item.IsCheck==2){
              item.ShowClass = 'color-main';
            }else{
              item.ShowClass = ''
            }
          });
          if (pull) {
            that.setData({
              amountList: that.data.amountList.concat(list)
            });
          } else {
            that.setData({
              amountList: list
            })
          }
          console.log(that.data.amountList.length)
          if (res.Data.Total <= that.data.amountList.length) {
            that.setData({
              pullLoading: false,
              loadingText: '没有更多数据了'
            })
          } else {
            that.setData({
              loadingText: '上拉显示更多',
              pullLoading: true,
              isShowLoading: true
            })
          }
          that.setData({
            loadComplete: true
          })
          that.isPullLoading = false;
        } else {
          util.showToast({
            text: '接口错误' + res.Msg
          })
        }
      },
      complete() {
        that.setData({
          loadComplete: true
        })
      }
    })
  },
  tabRequest(e) {
    const pageType = parseInt(e.currentTarget.dataset.type);
    let oldType = this.data.pageType;
    if (oldType == pageType) {
      return;
    }
    this.setData({
      pageType: pageType,
      pageIndex: 1,
      pageSize: 10,
      amountList: [],
      loadComplete: false,
      isShowLoading: false,
      loadingText: '',
      scrollTop: 0
    });
    this.data.pullLoading = true;
    this.getAmountList()
  },
  pullLoadingData() {
    var that = this;
    if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
      that.isPullLoading = true;
      that.data.pageIndex++;
      that.setData({
        pageIndex: that.data.pageIndex,
        loadingText: '正在加载更多数据~'
      });
      setTimeout(function () {
        that.getAmountList('pull');
      }, 1000)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.getAmountList();
    if (wx.getStorageSync('isLogin')) {
        this.getAmountList();
    } else {
        app.getUserInfo(() => {
            this.setData({
                showAuthorization: true
            })
        }, () => {
            this.getAmountList();
        })
    }
  },
  getuserinfo: function () {
      this.getAmountList();
      this.setData({
          showAuthorization: false
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this.setData({
          isClose: wx.getStorageSync("isClose")
      })
  }
})