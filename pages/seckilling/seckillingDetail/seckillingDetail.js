// seckillingDetail.js 
var app = getApp();
var util = require('../../../utils/util.js');
var WxParse = require('../../../wxparse/wxParse.js');
var richText = require('../../../utils/richText.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        IsShareCan: false,
        IsBindTellCan: false,
        waitStatus: false,
        hasStock: true,
        states: 1,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        productInfo: {},
        addressInfo: {},
        selectedSku: {
            selectedSkuImg: '',
            selectedSkuName: ["请选择商品规格"],
            selectedSkuPrice: 0
        },
        productSku: {},
        selectedCount: 1,
        selectedSkuId: '',
        selectedSkuStock: 0,
        otherSpellGroup: {
        },
        ActivityStock: 0,
        LimitNum: 0,
        token: '',
        nodes: [],
        copyright: {}
    },
    timer: null,
    SpellGroupSku: null,
    productSku: null,
    activityId: '',
    getTokenAndStock: '',
    getStocks: '',
    getStockes: '',
    KilledOrderNum: 0,
    IsBindTellCan: false,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            options,
        })
    },
    onShow: function () {
        if (!wx.getStorageSync('isLogin')) {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                this.initData(this, this.data.options);
            })
        } else {
            this.initData(this, this.data.options);
        }
        let that = this;
        if (wx.getStorageSync("requestStoreInfoSuccess")) {//判断店铺信息是否请求完成
            app.buttomCopyrightSetData(that, false, 'close');
            that.setData({
                isProbationShop: wx.getStorageSync("storeType")
            })
        } else {
            setTimeout(function () {
                app.buttomCopyrightSetData(that, false, 'close');
                that.setData({
                    isProbationShop: wx.getStorageSync("storeType")
                })
            }, 2000)
        }
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    getuserinfo: function () {
        this.initData(this, this.data.options);
        this.setData({
            showAuthorization: false
        })
    },
    initData: function (that, options) {
        var activityId = options.activityId;
        var that = this;

        if (options.status) {
            that.setData({
                waitStatus: true,
                isShowModal: true
            });
            that.getStockes = setInterval(function () {
                that.updateStock(options.activityId, options.skuId, options.selectedCount);
            }, 3000)
        }

        that.activityId = activityId;
        //请求详情页数据
        app.request({
            url: '/KillActivity/index',
            requestDomain: 'seckilling_domain',
            data: {
                id: that.activityId
            },
            success: function (data) {
                if (data.Code == 0) {
                    var datas = data.Data;
                    data = datas;
                    that.setData({
                        datas: datas
                    })
                    that.KilledOrderNum=0;
                    //是否绑定手机
                    if (datas.IsBindTellCan) {
                        app.request({
                            url: '/Member/GetMemberInfo',
                            data: {},
                            success: (res) => {
                                if (res.Code == 0) {
                                    if (res.Data.CellPhone == null) {
                                        // that.IsBindTellCan = false;
                                        // wx.redirectTo({
                                        //     url: '../../binduser/binduser?seckillBind=1&activityId=' + that.activityId
                                        // });
                                        app.navigateTo('../../binduser/binduser?seckillBind=1&activityId=' + that.activityId, 'redirectTo');
                                    }
                                } else {
                                    util.showToast(that, {
                                        text: '获取用户信息失败,' + res.Msg,
                                        duration: 2000
                                    });
                                }
                            },
                            complete: (res) => {
                                wx.hideLoading();
                            }
                        });
                    }
                    //是否需要分享 
                    if (datas.IsShareCan) {
                        app.request({
                            url: '/KillActivity/IsShare',
                            requestDomain: 'seckilling_domain',
                            data: {
                                ActivityId: that.activityId
                            },
                            success: function (data) {
                                if (!data.Data) {
                                    that.setData({
                                        IsShareCan: true
                                    })
                                }
                                that.setData({
                                    loadComplete: true
                                })
                            }
                        })
                    }
                    var states = datas.Status;
                    if (states == '已结束') {
                        that.setData({ states: 2 })
                    } else if (states == '进行中') {
                        that.setData({ states: 1 })
                    } else {
                        that.setData({ states: 0 })
                    }
                    datas.ProductSkus.forEach(function (item) {
                        that.KilledOrderNum += item.ActivityStock
                    })
                    if (that.KilledOrderNum <= 0) {
                        that.setData({ states: 2 })
                    }
                    var arr = [data.ImageUrl1, data.ImageUrl2, data.ImageUrl3, data.ImageUrl4, data.ImageUrl5];
                    var newArr = [];
                    for (var i = 0; i < 5; i++) {
                        if (arr[i] != null && arr[i] != "") {
                            newArr.push(arr[i])
                        }
                    }
                    var skuSetData = getSkuData(datas.ProductSkus);
                    var productSku = datas.ProductSkus;
                    var productId = datas.ProductId;
                    var skuName = [];
                    if (skuSetData.skuData.length > 0) {
                        skuName.push('请选择规格');
                    }
                    // var article = datas.Description;
                    // WxParse.wxParse('article', 'html', article, that, 5);
                    if (datas.Description) {
                        var article = richText.go(filterSource(datas.Description));
                        var a = filterVideo(article);
                        var b = splitArr(a, article);
                    }
                    that.setData({
                        datas: datas,
                        nodes: b,
                        productInfo: {
                            ImageUrls: newArr,
                            MarketPrice: datas.ProductOldPrice.toFixed(2),
                            Price: datas.ProductKillPrice.toFixed(2),
                            ProductName: datas.ProductName,
                            ProductSKU: skuSetData,
                            productSku: productSku,
                            ProductId: productId,
                            ProductImg: datas.ProductImg || newArr[0],
                            VideoUrl: datas.VideoUrl?datas.VideoUrl:'',
                            VideoImgUrl: datas.VideoImgUrl ? datas.VideoImgUrl:''
                        },
                        selectedSku: {
                            selectedSkuPrice: 0,
                            selectedSkuImg: newArr[0],
                            selectedSkuName: skuName
                        },
                        LimitNum: datas.LimitNum,
                        ActivityStock: that.KilledOrderNum,
                        ActivityTag: datas.ActivityTag,
                        ActivityEnd: util.timeDifference(datas.KillSaleEnd),
                        ActivityStart: leftTimer(datas.KillSaleStart).indexOf("N") > -1 ? util.timeDifference(datas.KillSaleStart) : leftTimer(datas.KillSaleStart),
                        productSku: productSku
                    });
                    that.timer = setInterval(function () {
                        that.setData({
                            ActivityStart: leftTimer(data.KillSaleStart).indexOf("N") > -1 ? util.timeDifference(data.KillSaleStart) : leftTimer(data.KillSaleStart),
                            ActivityEnd: util.timeDifference(data.KillSaleEnd)
                        })
                        if (that.data.states == 0) {
                          var now = new Date().getTime();
                          var date = data.KillSaleStart.replace(/[T]/g, ' ');
                          if (now > new Date(date).getTime()) {
                            that.setData({
                              states: 1
                            })
                          }
                        }
                        if (that.data.states == 1) {
                          var now = new Date().getTime();
                          var date = data.KillSaleEnd.replace(/[T]/g, ' ');
                          if (now > new Date(date).getTime()) {
                            that.setData({
                              states: 2
                            })
                          }
                        }
                    }, 1000)
                    if (!datas.IsShareCan) {
                        that.setData({ loadComplete: true })
                    }
                    if (datas.ProductSkus.length == 1 && datas.ProductSkus[0].ProductSKU_Propertys.length == 0) {
                        var thisData = that.data;
                        that.data.selectedSkuId = datas.ProductSkus[0].SkuId;
                        thisData.selectedSku.selectedSkuImg = datas.ProductSkus[0].SkuImgUrl;
                        thisData.selectedSku.selectedSkuPrice = datas.ProductKillPrice.toFixed(2);
                        thisData.selectedSkuStock = that.KilledOrderNum;
                        var productInfo = that.data.productInfo;
                        var selectedSku = that.data.selectedSku;
                        that.setData({
                            productInfo: productInfo,
                            selectedSku: selectedSku,
                            selectedSkuStock: thisData.selectedSkuStock
                        })
                    }
                    if (datas.ProductSkus.length == 1 && datas.ProductSkus[0].ProductSKU_Propertys.length == 1) {
                        that.data.selectedSkuId = datas.ProductSkus[0].SkuId;
                        var thisData = that.data;
                        that.data.productInfo.ProductSKU.skuData[0].values[0].selected = 'select';
                        that.data.selectedSku.selectedSkuName[0] = that.data.productInfo.ProductSKU.skuData[0].values[0].vname;
                        var thisData = that.data;
                        that.data.productSku.forEach(function (item, index) {
                            var attrInnerData = [];
                            item.ProductSKU_Propertys.forEach(function (item1, index1) {
                                attrInnerData.push(item1.VName);
                            })
                            if (attrInnerData.toString() == thisData.selectedSku.selectedSkuName.toString()) {
                                thisData.selectedSku.selectedSkuImg = item.SkuImgUrl;
                                thisData.selectedSkuId = item.SkuId;
                                that.data.productSku.forEach(function (groupSku) {
                                    if (groupSku.SkuId == item.SkuId) {
                                        thisData.selectedSku.selectedSkuPrice = groupSku.KillPrice.toFixed(2);
                                        thisData.selectedSkuStock = groupSku.ActivityStock;
                                    }
                                })
                            }
                        });
                        var productInfo = that.data.productInfo;
                        var selectedSku = that.data.selectedSku;
                        that.setData({
                            productInfo: productInfo,
                            selectedSku: selectedSku,
                            selectedSkuStock: thisData.selectedSkuStock
                        })
                    }
                }
            }
        })
    },
    buyNow: function (e) {//   
        var that = this;
        if (that.data.states == 1) {
            if (app.globalData.refuseAuthFlag) {//判断是否拒绝了授权，未授权则拉起再次授权
                util.showToast(this, {
                    text: '未授权登录的用户',
                    duration: 2000
                });
                return;
            } else {
                if (!wx.getStorageSync('isLogin')) {
                    util.showToast(this, {
                        text: '未授权登录的用户',
                        duration: 2000
                    });
                    return;
                }
                if (that.data.IsShareCan) {
                    app.request({
                        url: '/KillActivity/IsShare',
                        requestDomain: 'seckilling_domain',
                        data: {
                            ActivityId: that.activityId
                        },
                        success: function (data) {
                            if (!data.Data) {
                                util.showToast(that, {
                                    text: '分享即可参与活动',
                                    duration: 2000
                                });
                                that.setData({
                                    IsShareCan: true
                                })
                                return;
                            }
                        }
                    })
                    return;
                }
                if (this.data.productInfo.ProductSKU.skuData.length > 0 && this.data.selectedSkuId == '') {//有规格且没有选择规格则弹出提示
                    util.showToast(this, {
                        text: '请选择商品规格！',
                        duration: 2000
                    });
                    return;
                }
                if (this.data.productInfo.ProductSKU.skuData.length == 0 && !this.data.selectedSkuId) {
                    this.data.selectedSkuId = this.data.defaultSkuId;
                }
                if (!this.data.selectedCount) {
                    util.showToast(this, {
                        text: '请选择购买数量！',
                        duration: 2000
                    });
                    return;
                }
                if (Number(this.data.selectedCount) > Number(this.data.selectedSkuStock)) {
                    util.showToast(this, {
                        text: '该商品库存不足！',
                        duration: 2000
                    });
                    return;
                }
                //判断是否可以购买以及验证令牌和库存，直到都满足就跳转
                that.canBuy();
            }
        } else if (that.data.states == 2) {
            util.showToast(that, {
                text: '活动已结束',
                duration: 2000
            });
        } else if (that.data.states == 0) {
            util.showToast(this, {
                text: '活动未开始',
                duration: 2000
            });
            return;
        };
    },
    canBuy: function () {
        var that = this;
        var skuId = that.data.selectedSkuId;
        var num = that.data.selectedCount;
        app.request({
            url: '/Order/GetCanBuyNum',
            requestDomain: 'seckilling_domain',
            data: {
                activitiesId: that.activityId,
                SkuId: skuId
            },
            success: function (res) {
                console.log(res)
                if (res.Data < that.data.selectedCount) {
                    util.showToast(that, {
                        text: '超过限购数量',
                        duration: 2000
                    });
                    setTimeout(function () {
                        // wx.redirectTo({
                        //     url: `/pages/seckilling/mySeckilling/mySeckilling`
                        // })
                        app.navigateTo(`/pages/seckilling/mySeckilling/mySeckilling`, 'redirectTo');
                    }, 1500)
                    return;
                } else {
                    that.closePopup();
                    that.firstCreatToken(that.activityId, skuId, num)
                }
            }
        })
    },
    updateStock: function (activityId, skuId, num) {
        var that = this;
        app.request({
            url: '/KillActivity/GetActivityStock',
            requestDomain: 'seckilling_domain',
            data: {
                id: activityId,
                skuId: skuId,
                productNum: num
            },
            success: function (data) {
                if (data.Code == 0) {
                    wx.getStorage({
                        key: 'orderData',
                        success: function (res) {
                            const datas = JSON.parse(res.data);
                            app.request({
                                url: '/Order/CreateOrder',
                                requestDomain: 'seckilling_domain',
                                data: datas,
                                success(res) {
                                    const orderId = res.Data;
                                    if (res.Code == 0) {
                                        clearInterval(that.getStockes);
                                        // wx.redirectTo({
                                        //     url: `../confirmorder/confirmorder?orderId=${orderId}`
                                        // })
                                        app.navigateTo(`../confirmorder/confirmorder?orderId=${orderId}`, 'redirectTo');
                                    }
                                }
                            })
                        },
                    })
                } else if (data.Code == 3) {
                    that.setData({
                        hasStock: false,
                        isShowModal: false
                    })
                    clearInterval(that.getStockes);
                }
            },
            fail: function () {
                util.showToast(that, {
                    text: '服务器出错',
                    duration: 2000
                });
            }
        })
    },
    firstCreatToken: function (activityId, skuId, num) {
        var that = this;
        app.request({
            url: '/Token/Create',
            requestDomain: 'token_domain',
            data: {
                id: activityId
            },
            success: function (data) {
                if (data.Code == 0) {
                    var token = data.Data.Token;
                    wx.setStorageSync("Xcx-RequestToken", token)
                    that.getStock(activityId, skuId, num);
                } else {
                    that.setData({
                        isShowModal: true,
                        specifications: ''
                    })
                    that.creatToken(activityId, skuId, num);
                }
            },
            fail: function () {
                util.showToast(that, {
                    text: '服务器出错',
                    duration: 2000
                });
            }
        })
    },
    //创建令牌
    creatToken: function (activityId, skuId, num) {
        var that = this;
        var CreateToken = setInterval(function () {
            app.request({
                url: '/Token/Create',
                requestDomain: 'token_domain',
                data: {
                    id: activityId
                },
                success: function (data) {
                    if (data.Code == 0) {
                        clearInterval(CreateToken)
                        var token = data.Data.Token;
                        wx.setStorageSync("Xcx-RequestToken", token)
                        that.getStock(activityId, skuId, num);
                    }
                },
                fail: function () {
                    util.showToast(that, {
                        text: '服务器出错',
                        duration: 2000
                    });
                }
            })
        }, 3000)
    },
    getStock: function (activityId, skuId, num) {
        var that = this;
        app.request({
            url: '/KillActivity/GetActivityStock',
            requestDomain: 'seckilling_domain',
            data: {
                id: activityId,
                skuId: skuId,
                productNum: num
            },
            success: function (data) {
                if (data.Code == 0) {
                    wx.hideLoading()
                    // wx.redirectTo({
                    //     url: '../../seckilling/submitorder/submitorder?type=submitbuy&productId=' + that.data.productInfo.ProductId + '&skuId=' + that.data.selectedSkuId + '&activityId=' + that.activityId + '&skuId=' + that.data.selectedSkuId + '&selectedCount=' + that.data.selectedCount
                    // });
                    app.navigateTo('../../seckilling/submitorder/submitorder?type=submitbuy&productId=' + that.data.productInfo.ProductId + '&skuId=' + that.data.selectedSkuId + '&activityId=' + that.activityId + '&skuId=' + that.data.selectedSkuId + '&selectedCount=' + that.data.selectedCount, 'redirectTo');
                    clearInterval(that.getStocks);
                } else if (data.Code == 3) {
                    that.setData({
                        hasStock: false,
                        isShowModal: false
                    })
                    clearInterval(that.getStocks);
                } else if (data.Code == 4) {
                    that.setData({
                        waitStatus: false,
                        isShowModal: true,
                        specifications: ''
                    });
                    that.GetStock(activityId, skuId, num);
                }
            },
            fail: function () {
                util.showToast(that, {
                    text: '服务器出错',
                    duration: 2000
                });
            }
        })
    },
    GetStock: function (activityId, skuId, num) {
        var that = this;
        that.getStocks = setInterval(function () {
            app.request({
                url: '/KillActivity/GetActivityStock',
                requestDomain: 'seckilling_domain',
                data: {
                    id: activityId,
                    skuId: skuId,
                    productNum: num
                },
                success: function (data) {
                    if (data.Code == 0) {
                        wx.hideLoading()
                        clearInterval(that.getStocks);
                        // wx.redirectTo({
                        //     url: '../../seckilling/submitorder/submitorder?type=submitbuy&productId=' + that.data.productInfo.ProductId + '&skuId=' + that.data.selectedSkuId + '&activityId=' + that.activityId + '&skuId=' + that.data.selectedSkuId + '&selectedCount=' + that.data.selectedCount
                        // });
                        app.navigateTo('../../seckilling/submitorder/submitorder?type=submitbuy&productId=' + that.data.productInfo.ProductId + '&skuId=' + that.data.selectedSkuId + '&activityId=' + that.activityId + '&skuId=' + that.data.selectedSkuId + '&selectedCount=' + that.data.selectedCount, 'redirectTo');
                    } else if (data.Code == 3) {
                        that.setData({
                            hasStock: false,
                            isShowModal: false
                        })
                        clearInterval(that.getStocks);
                    }
                },
                fail: function () {
                    util.showToast(that, {
                        text: '服务器出错',
                        duration: 2000
                    });
                }
            })
        }, 3000)

    },
    minusStock: function (e) {
        var count = parseInt(this.data.selectedCount) - 1;
        if (count == 0) {
            count = 1;
        }
        this.setData({
            selectedCount: count
        });
    },
    addStock: function (e) {
        var count = parseInt(this.data.selectedCount) + 1;
        //判断库存
        if (this.data.selectedSkuStock >= this.data.LimitNum) {
            if (count > this.data.LimitNum && this.data.LimitNum != 0) {
                count--;
            }
        } else {
            if (count > this.data.selectedSkuStock) {
                count--;
            }
        }
        this.setData({
            selectedCount: count
        });
    },
    selectSpecifications: function (e) {
        if (this.data.states == 1) {
            this.setData({
                specifications: 'show',
            })
        } else if (this.data.states == 2) {
            var btns = e.target.dataset.btn;
            if (btns == "1") {
                // wx.redirectTo({
                //     url: '../../pintuan/index/index'
                // });
                app.navigateTo('/pages/pintuan/index/index', 'redirectTo');
            } else {
                this.setData({
                    specifications: 'show',
                })
            }
        } else if (this.data.states == 0) {
            var btns = e.target.dataset.btn;
            if (btns != '1') {
                this.setData({
                    specifications: 'show',
                })
            }
        }

    },
    closePopup: function () {
        this.setData({
            specifications: 'hide'
        })
    },
    close: function () {
        var that = this;
        clearInterval(that.getTokenAndStock);
        clearInterval(that.getStocks);
        this.setData({
            isShowModal: false
        })
    },
    selectedSp: function (e) {
        var that = this;
        var parentIndex = e.target.dataset.parentindex;
        var currentIndex = e.target.dataset.currentindex;
        this.data.productInfo.ProductSKU.skuData[parentIndex].values.map(function (item) {
            item.selected = "";
        })
        this.data.productInfo.ProductSKU.skuData[parentIndex].values[currentIndex].selected = 'select';
        this.data.selectedSku.selectedSkuName[parentIndex] = this.data.productInfo.ProductSKU.skuData[parentIndex].values[currentIndex].vname;
        var arr = [].concat(this.data.selectedSku.selectedSkuName);
        var thisData = this.data;
        this.data.productSku.forEach(function (item, index) {
            var attrInnerData = [];
            item.ProductSKU_Propertys.forEach(function (item1, index1) {
                attrInnerData.push(item1.VName);
            })
            if (attrInnerData.sort().toString() == arr.sort().toString()) {
                thisData.selectedSku.selectedSkuImg = item.SkuImgUrl;
                thisData.selectedSkuId = item.SkuId;
                that.data.productSku.forEach(function (groupSku) {
                    if (groupSku.SkuId == item.SkuId) {
                        thisData.selectedSku.selectedSkuPrice = groupSku.KillPrice.toFixed(2);
                        thisData.selectedSkuStock = groupSku.ActivityStock;
                    }
                })
            }
        });
        var productInfo = this.data.productInfo;
        var selectedSku = this.data.selectedSku;
        this.setData({
            productInfo: productInfo,
            selectedSku: selectedSku,
            selectedSkuStock: thisData.selectedSkuStock
        })
    },
    onHide() {
        clearInterval(this.getStocks);
        clearInterval(this.timer)
    },
    onUnload() {
        clearInterval(this.getStocks);
        clearInterval(this.timer)
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var that = this;
        var shopInfo = wx.getStorageSync('shopInfo');
        var siteName = shopInfo ? shopInfo.SiteName : '';
        var shopId = wx.getStorageSync('shopId');
        return {
            title: siteName,
            path: '/pages/seckilling/seckillingDetail/seckillingDetail?activityId=' + that.activityId + '&shopId=' + shopId,
            success: function (res) {
                console.log('转发成功，shopId:' + shopId);
                // 转发成功

                if (that.data.IsShareCan) {
                    app.request({
                        url: '/KillActivity/AddShare',
                        requestDomain: 'seckilling_domain',
                        data: {
                            ActivityId: that.activityId
                        },
                    })
                }

                that.setData({
                    IsShareCan: false
                })
            },
            fail: function (res) {
                console.log('转发失败，shopId:' + shopId)
                // 转发失败 
            }
        }
    },
    goIndex: function () {
        // wx.redirectTo({
        //     url: '/pages/pintuan/index/index'
        // })
        app.navigateTo('/pages/pintuan/index/index', 'redirectTo');
    },
    goMember: function () {
        // wx.switchTab({
        //     url: '/pages/membercenter/membercenter'
        // })
        app.navigateTo('/pages/membercenter/membercenter', 'switchTab');
    },
    handleDetailClick(e) {
      const { ele } = e.currentTarget.dataset;
      const childEle = ele.children[0];
      if (childEle.name === 'img') {
        const imgSrc = childEle.attrs.src;
        wx.previewImage({
          current: imgSrc, // 当前显示图片的http链接
          urls: [imgSrc] // 需要预览的图片http链接列表
        })
      }
    },
})
//处理规格
function getSkuData(sku) {
    var priceList = [];
    var skuData = [];
    var skuImgUrl = [];
    var sku = sku || [];
    sku.forEach(function (item) {
        //不存储重复价格
        priceList.push(item.OldPrice.toFixed(2));
        skuImgUrl.push(item.SkuImgUrl);
        item.ProductSKU_Propertys.forEach(function (sub) {
            var status = true;
            skuData.forEach(function (list, index) {
                if (list.pid == sub.PId) {
                    var tempStatus = true;
                    skuData[index].values.forEach(function (vlist) {
                        if (vlist.vid == sub.VId) {
                            tempStatus = false;
                        }
                    });
                    if (tempStatus) {
                        skuData[index].values.push({ vid: sub.VId, vname: sub.VName });
                    }
                    status = false;
                }
            });
            if (status) {
                skuData.push({ pid: sub.PId, pname: sub.PName, values: [{ vid: sub.VId, vname: sub.VName }] });
            }
        });
    });
    var skuInfo = {
        priceList: priceList,
        skuImgUrl: skuImgUrl,
        skuData: skuData
    };
    return skuInfo;
}
//倒计时
function leftTimer(endDate) {
    var endTime = endDate.replace('T', ' ').replace(/\-/g, '/');
    var leftTime = new Date(endTime).getTime() - new Date().getTime(); //计算剩余的毫秒数 
    var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
    var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
    var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
    var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 
    days = days < 10 && days > 0 ? '0' + days : days;
    hours = hours < 10 && hours > 0 ? '0' + hours : hours;
    minutes = minutes < 10 && minutes > 0 ? '0' + minutes : minutes;
    seconds = seconds < 10 && seconds > 0 ? '0' + seconds : seconds;
    return days + '天 ' + hours + ':' + minutes + ':' + seconds;
}

function splitArr(arr1, arr2) {
    setFlag(arr1, arr2);
    var newArr = cloneObj(arr2);
    var newArr2 = cloneObj(arr2);
    //var indexArr=[];
    arr1.forEach(function (item, index) {
        //var obj = { name: "video", children: newArr[item.parentIdx].children[item.Index] };
        var obj = { name: "video", children: item };
        var index = findArrIndex(item.parentIdx, item.Index, arr2);
        var length = arr2[index].children.length;
        arr2[index].children.splice(item.Index, length);
        var newChildren = newArr2[item.parentIdx].children.slice(item.Index + 1);
        arr2.splice(item.Index + index, 0, obj);
        //indexArr.push(index);
        if (newChildren.length > 0) {
            var len = newArr2[item.parentIdx].children.length;
            var newParentObj = cloneObj(newArr2[item.parentIdx]);
            newParentObj.children.splice(0, len);
            newParentObj.children = newChildren;
            var insertIndex = caclIndex(arr1, arr2, newArr2);
            insertIndex.forEach(function (item, index) {
                if (item.videoId === newParentObj.videoId) {
                    arr2.splice(item.index + item.count + 1, 0, newParentObj);
                }
            })
        }
    });
    return arr2;
}
function cloneObj(obj) {
    var str, newobj = obj.constructor === Array ? [] : {};
    if (typeof obj !== 'object') {
        return;
    } else if (window) {
        str = JSON.stringify(obj), //系列化对象
            newobj = JSON.parse(str); //还原
    } else {
        for (var i in obj) {
            newobj[i] = typeof obj[i] === 'object' ?
                cloneObj(obj[i]) : obj[i];
        }
    }
    return newobj;
};
function filterVideo(arr) {
    var videoArr = [];
    var videoObj = {};
    arr.forEach(function (item, index) {
        item.children.forEach(function (v, i) {
            if (v.name && v.name === "video") {
                videoObj = cloneObj(v.attrs);
                videoObj.parentIdx = index;
                videoObj.Index = i;
                videoArr.push(videoObj);
            }
        })
    })
    return videoArr;
}
function caclIndex(arr1, arr2, newArr2) {
    let arr = [];
    for (var i = 0; i < arr2.length; i++) {
        if (arr2[i].videoId) {
            let count = 0, index = i, videoId = arr2[i].videoId;
            for (var j = 0; j < newArr2.length; j++) {
                if (arr2[i].videoId && newArr2[j].videoId && arr2[i].videoId === newArr2[j].videoId) {
                    for (var k = 0; k < arr2.length; k++) {
                        if (k > i && arr2[k].name === "video" && arr2[k].children.parentIdx == j) {
                            count++;
                        }
                    }
                }
            }
            arr.push({ count: count, index: index, videoId: videoId });
        }
    }
    return arr;
}
function findArrIndex(parentIdx, Index, arr2) {
    var indx;
    for (var i = 0; i < arr2.length; i++) {
        if (arr2[i].videoId && arr2[i].videoId === "" + parentIdx + Index) {
            return i;
        }
    }
    return indx;
}
function setFlag(arr1, arr2) {
    arr1.forEach(function (item, index) {
        arr2[item.parentIdx].videoId = "" + item.parentIdx + item.Index;
    })
}
function filterSource(str) {
    str = str || '';
    var reg = /<source.*?\/>/g;
    str = str.replace(reg, '');
    return str;
}