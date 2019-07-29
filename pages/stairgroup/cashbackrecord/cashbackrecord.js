// pages/stairgroup/cashbackrecord/cashbackrecord.js
const app = getApp();
const util = require('../../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that=this;
        this.setData({ options});
        if (!wx.getStorageSync('isLogin')) {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.initData(this, options);
            })
        } else {
          that.initData(this, options);
        }
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    onShow:function (){
        app.buttomCopyrightSetData(this, false, 'close');
    },
    getuserinfo: function () {
      this.initData(this, this.options);
      this.setData({
        showAuthorization: false
      })
    },
    initData: function (that, options){
        const {orderId} = options;
        app.request({
            url: '/StairGroup/OrderInfo',
            requestDomain: 'ymf_domain',
            data: {
                orderId
            },
            success(res) {
                if (res.Code == 0) {
                    let data = JSON.parse(res.Data);
                    console.log(data);
                    //处理阶梯价格
                    let cashBackTotal = 0,
                        cashBackDesc = [],
                        StairGroupPriceList = data.OrderData.StairGroup.StairGroupPriceList;
                    StairGroupPriceList.forEach((v, i) => {
                        let text = i == 0 ? '' : '或';
                        if (i == StairGroupPriceList.length - 1) cashBackTotal = v.ReturnMoney;
                        cashBackDesc.push(`${text} 满${v.SaleNum}件每件返现￥${v.ReturnMoney.toFixed(2)}`)
                    })
                    //处理返现记录
                    for (let k of data.OrderData.RefundRecord) {
                        k.RefundPrice = k.RefundPrice.toFixed(2);
                        k.CreateDateTime = k.CreateDateTime.replace('T', ' ')
                    }
                    that.setData({
                        StairGroupInfo: {
                            ActivityId: data.OrderData.ActivityId,
                            ActivityTag: data.OrderData.ActivityTag,
                            Freight: data.OrderData.Freight.toFixed(2),
                            PayMoney: data.OrderData.PayMoney.toFixed(2),
                            Quantity: data.OrderData.Quantity,
                            SalePrice: data.OrderData.SalePrice.toFixed(2),
                            ReturnMoney: data.OrderData.ReturnMoney.toFixed(2),
                            SkuName: data.SkuName,
                            ActivityTag: data.OrderData.StairGroup.ActivityTag,
                            ProductImg: data.OrderData.StairGroup.ProductImg,
                            ProductName: data.OrderData.StairGroup.ProductName,
                            SaleNum: data.OrderData.StairGroup.SaleNum,
                            cashBackTotal: cashBackTotal.toFixed(2),
                            cashBackDesc
                        },
                        RefundRecord: data.OrderData.RefundRecord,
                        StairGroupPriceList
                    })
                } else {
                    util.showToast(that, {
                        text: res.Msg,
                        duration: 2000
                    });
                }
            },
            complete() {
                that.setData({
                    loadComplete: true
                })
            }
        })
    },
    shareFriend() {
        this.onShareAppMessage();
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const that = this;
        const siteName = `【${that.data.StairGroupInfo.ActivityTag}】${that.data.StairGroupInfo.ProductName}`,
            shopId = wx.getStorageSync('shopId');
        return {
            title: siteName,
            path: `/pages/stairgroup/activitydetail/activitydetail?activityId=${that.data.StairGroupInfo.ActivityId}&shopId=${shopId}`,
            success: function (res) {
                console.log(`/pages/stairgroup/activitydetail/activitydetail?activityId=${that.data.StairGroupInfo.ActivityId}&shopId=${shopId}`)
                console.log('转发成功，shopId:' + shopId);
                // 转发成功
            },
            fail: function (res) {
                console.log('转发失败，shopId:' + shopId)
                // 转发失败
            }
        }
    }
})