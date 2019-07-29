// pages/storesetting/storesetting.js
// 店铺信息
const app = getApp();
const util = require('../../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        enableLogo: false,
        enableStoreName: false,
        storeDescription: '',
        storeLogo: '',
        storeName: '',
        isShowToast: false,
        toastText: {},
        copyright: {}
    },
    backPre() {
        wx.navigateBack({
            delta: 1
        });
    },
    editStoreInfo(e) {
        if (!this.data.enableStoreName) {
            return;
        }
        const editType = e.currentTarget.dataset.type;
        let storeInfo = editType == 0 ? encodeURIComponent(this.data.storeName) : this.data.storeDescription;
        // wx.navigateTo({
        //   url: `../storesetting/storesetting?type=${editType}&storeInfo=${storeInfo}`
        // })
        app.navigateTo(`../storesetting/storesetting?type=${editType}&storeInfo=${storeInfo}`, 'navigateTo');
    },
    uploadLogo(e) {
        const that = this;
        if (!this.data.enableLogo) {
            return;
        }
        wx.chooseImage({
            count: 1,
            success: function (res) {
                const logoSrc = res.tempFilePaths[0];
                wx.showLoading({
                    title: '上传中'
                });
                //console.log(logoSrc);
                app.request({
                    url: '/Distributor/UploadStoreLogo',
                    contentType: 'multipart/form-data',
                    requestType: 'upload',
                    filePath: logoSrc,
                    data:{
                      requestDomain: 'fxs_domain'
                    },
                    fileName: that.data.storeName+'logo',
                    success(res) {
                        let resObj = JSON.parse(res);
                        //console.log(res);
                        if (resObj.Code === 0) {
                            that.setData({ storeLogo: logoSrc })
                            app.request({
                                url: '/Distributor/EditStoreInfo',
                                data: {
                                    CellPhone: '',
                                    StoreLogo: resObj.Data,
                                    StoreDescription: that.data.storeDescription,
                                    StoreName: that.data.storeName
                                },
                                success(tRes) {
                                    wx.hideLoading();
                                    let text = tRes.Code === 0 ? ('保存' + (tRes.Data ? '成功' : '失败')) : ('接口访问失败' + tRes.Msg);
                                    util.showToast(that, {
                                        text,
                                        duration: 2000
                                    })
                                }
                            })
                        } else {
                            wx.hideLoading()
                            util.showToast(that, {
                                text: '上传失败' + res.Msg,
                                duration: 2000
                            })
                        }
                    }
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
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
        app.buttomCopyrightSetData(this, 'fixed', 'close');
        if (wx.getStorageSync('isLogin')) {
            this.initData();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData();
            })
        }
    },
    getuserinfo: function () {
        this.initData();
        this.setData({
            showAuthorization: false
        })
    },
    initData(){
        const that = this;
        app.request({
            url: '/Distributor/GetStoreInfo',
            data: {
                requestDomain: 'fxs_domain'
            },
            success(res) {
                if (res.Code === 0) {
                    that.setData({
                        storeLogo: res.Data.StoreLogo ? res.Data.StoreLogo : 'http://file.xiaokeduo.com/system/xkdxcx/system/images/logo-default.png',//处理缺省图片
                        storeName: res.Data.StoreName ? res.Data.StoreName : '',
                        storeDescription: res.Data.StoreDescription ? res.Data.StoreDescription : '',
                        enableLogo: res.Data.EnableLogo,
                        enableStoreName: res.Data.EnableStoreName
                    })
                } else {
                    util.showToast(that, {
                        text: '接口错误' + res.Msg,
                        duration: 2000
                    })
                }
            },
            complete() {
                that.setData({ loadComplete: true })
            }
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})