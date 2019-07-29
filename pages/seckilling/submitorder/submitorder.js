// pages/seckilling/submitorder/submitorder.js
var app = getApp();
var filter = app;
var util = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogo: wx.getStorageSync("IsOpenCopyRight"),
        logoSrc: wx.getStorageSync("copyRightLogo"),
        loadComplete: false,
        isSelectedAddress: false,
        isAuthAddress: false,
        seckillingOrderList: {},
        isPopupShow: '',
        freight: 0,
        shipText: '请选择',
        shipValue: 0,
        Remark: '',
        regionInfo: {
            regionMemberName: '游客',
            regionProvince: '',
            regionCity: '',
            regionCounty: '',
            regionStreet: '',
            regionAddress: '',
            regionCellPhone: '',
            regionId: 0,
            id: 0
        },
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;
        if (options.shippingId == undefined) return;
        const nums = options.selectedCount;
        const id = options.activityId;
        app.request({
            url: '/KillActivity/Index',
            requestDomain: 'seckilling_domain',
            data: {
                id
            },
            success: function (res) {
                if (res.Code == 0) {
                    const data = res.Data;
                    const ProductName = data.ProductName,
                        ProductSkus = data.ProductSkus;
                    let killPrice, SkuName, ProductImg, skus = [];
                    ProductSkus.forEach(function (value) {
                        if (options.skuId == value.SkuId) {
                            killPrice = value.KillPrice.toFixed(2);
                            SkuName = value.SkuName;
                        }
                    });
                    let total = (nums * killPrice).toFixed(2);
                    ProductSkus.forEach(function (value) {
                        if (options.skuId == value.SkuId) {
                            ProductImg = value.SkuImgUrl || data.ImageUrl1;
                            value.ProductSKU_Propertys.forEach(function (sku) {
                                skus.push(sku.PName + "：" + sku.VName);
                            });
                        };
                    });
                    let AmountPayable = ((nums * killPrice) + Number(that.data.freight)).toFixed(2);
                    that.setData({
                        seckillingOrderList: {
                            killPrice,
                            SkuName,
                            skus,
                            ProductName,
                            ProductImg,
                            ProductNum: nums,
                            total
                        },
                        freight: Number(that.data.freight).toFixed(2),
                        activityId: id,
                        ActivityTag: data.ActivityTag,
                        skuId: options.skuId,
                        ProductId: data.ProductId,
                        templateId: data.FreightTemplateId,
                        AmountPayable: AmountPayable
                    })
                    if (that.data.templateId == 0) {
                        that.setData({
                            shipText: '包邮'
                        })
                    }
                } else {
                    util.showToast(that, {
                        text: res.Msg,
                        duration: 2000
                    });
                }
            },
            complete: function () {
                that.setData({
                    loadComplete: true
                })
            }
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    //获取运费方式列表
    selectDeliveryType() {
        const that = this;
        const templateId = that.data.templateId;
        var shipId = that.data.regionInfo.id;
        if (templateId == 0) {
            return;
        }
        if (shipId == 0) {
            util.showToast(that, {
                text: '请先添加收货地址',
                duration: 2000
            });
            return;
        }
        wx.showLoading({
            title: '配送方式加载中！',
        });
        app.request({
            url: '/Order/GetFreeShipping',
            requestDomain: 'seckilling_domain',
            data: {
                templateid: templateId
            },
            success: function (res) {
                let data = JSON.parse(res.Data)
                if (res.ResultType == 0) {
                    const deliveryList = data;
                    that.setData({
                        deliveryList,
                        isPopupShow: 'show'
                    });
                } else {
                    util.showToast(that, {
                        text: '接口访问失败' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete: function (res) {
                wx.hideLoading();
            }
        });
    },
    //选择运费方式
    selectDeliveryMode: function (e) {
        const index = e.currentTarget.dataset.index;
        const value = e.currentTarget.dataset.value;
        const key = e.currentTarget.dataset.key;
        this.data.deliveryList.map(function (item) {
            item.isChecked = '';
        });
        this.data.deliveryList[index].isChecked = 'checked';
        if (value == 0) {
            this.setData({
                templateId: 0
            });
        }
        this.setData({
            deliveryList: this.data.deliveryList,
            shipText: key,
            shipValue: value,
            isPopupShow: ''
        });
        //计算运费
        const templateId = this.data.templateId;
        const productNum = this.data.seckillingOrderList.ProductNum;
        const sumPrice = this.data.seckillingOrderList.total;
        this.getFreight(templateId, value, '', productNum, sumPrice);
    },
    closePopup() {
        this.setData({
            isPopupShow: ''
        })
    },
    /*添加收货地址*/
    addNewAddress: function () {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '是否使用微信收货地址？',
            confirmText: '是',
            cancelText: '否',
            success: function (res) {
                if (res.confirm) { //使用微信地址
                    that.chooseAddress();
                } else if (res.cancel) { //使用销客多地址
                    // wx.navigateTo({
                    //     url: '../../address/address?addressId=0' //&type=' + that.data.pageType + '&productId=' + that.data.productId + '&skuId=' + that.data.skuId + '&selectedCount=' + that.data.selectedCount + '&selectIds=' + that.data.selectIds
                    // });
                    app.navigateTo('../../address/address?addressId=0', 'navigateTo');
                }
            }
        });
    },
    chooseAddress: function () {
        var that = this;
        wx.chooseAddress({
            success: function (successData) {
                //获取对应的regionId
                that.setData({
                    isSelectedAddress: true,
                    regionInfo: {
                        regionMemberName: successData.userName,
                        regionProvince: successData.provinceName,
                        regionCity: successData.cityName,
                        regionCounty: successData.countyName,
                        regionAddress: successData.detailInfo,
                        regionCellPhone: successData.telNumber,
                        regionId: 0
                    }
                });
                that.addAddress();
            },
            fail: function (failData) {

            }
        });
    },
    addAddress: function () {
        var that = this;
        filter.request({
            url: '/MemberAddress/AddAndSetDefault',
            data: {
                address: that.data.regionInfo.regionAddress,
                cellPhone: that.data.regionInfo.regionCellPhone,
                city: that.data.regionInfo.regionCity,
                county: that.data.regionInfo.regionCounty,
                province: that.data.regionInfo.regionProvince,
                shipTo: that.data.regionInfo.regionMemberName
            },
            success: function (res) {
                //返回值改成id，并写人data.regionInfo里面
                if (res.Code == 0) {
                    var regionInfo = that.data.regionInfo;
                    regionInfo.id = res.Data;
                    that.setData({
                        regionInfo: regionInfo
                    });
                    var shippingId = that.data.regionInfo.id;
                    that.options.shippingId = shippingId;
                    that.onShow();
                }
            }
        });
    },
    /*选择收货地址*/
    goAddressList: function () {
        // wx.navigateTo({
        //     url: '../../addresslist/addresslist' //?type=' + that.data.pageType + '&productId=' + that.data.productId + '&skuId=' + that.data.skuId + '&selectedCount=' + that.data.selectedCount + '&selectIds=' + that.data.selectIds
        // });
        app.navigateTo('../../addresslist/addresslist', 'navigateTo');
    },
    /*计算运费*/
    getFreight: function (templateId, shipModelId, cartIds, productNum, sumPrice, currentOrderIndex) {
        const that = this;
        const productId = that.data.ProductId ? that.data.ProductId : '';
        const regionId = that.data.regionInfo.regionId;
        const skuId = that.data.skuId ? that.data.skuId : '';
        filter.request({
            url: '/Order/CountFreeShipping',
            requestDomain: 'seckilling_domain',
            data: {
                ProductIds: productId,
                Regionid: regionId,
                templateId,
                modelId: shipModelId,
                CartIds: cartIds,
                ProductNum: productNum,
                Skuid: skuId,
                SumPrice: sumPrice
            },
            success: function (res) {
                if (res.ResultType == 0) {
                    const totalFreight = parseFloat(res.AppendData);
                    const productTotal = parseFloat(that.data.seckillingOrderList.total);
                    const totalPrice = productTotal + totalFreight;
                    that.setData({ //更新运费,合计
                        freight: totalFreight.toFixed(2),
                        AmountPayable: totalPrice.toFixed(2)
                    });
                } else {
                    util.showToast(that, {
                        text: '接口访问失败' + res.Msg,
                        duration: 2000
                    });
                }
            }
        });
    },
    // 留言
    remarkinput: function (e) {
        const Remark = e.detail.value;
        this.setData({
            Remark
        })
    },
    //提交
    submitOrder(e) {
        const that = this,
            templateId = this.data.templateId,
            shipModelId = this.data.shipValue,
            id = this.data.regionInfo.id;
        if (id == 0) {
            util.showToast(that, {
                text: '请设置收货地址',
                duration: 2000
            });
            return;
        }
        if (templateId > 0 && shipModelId <= 0) {
            util.showToast(that, {
                text: '请选择配送方式',
                duration: 2000
            });
            return;
        }
        const shippingModeName = that.data.shipText,
            Address = that.data.regionInfo.Address,
            Remark = that.data.Remark,
            total = that.data.seckillingOrderList.total,
            activityId = that.data.activityId,
            ActivityTag = that.data.ActivityTag,
            freight = that.data.freight,
            ProductId = that.data.ProductId,
            ProductName = that.data.seckillingOrderList.ProductName,
            ProductNum = that.data.seckillingOrderList.ProductNum,
            ShipTo = that.data.regionInfo.regionMemberName,
            SkuId = that.data.skuId,
            SkuName = that.data.seckillingOrderList.SkuName,
            ProductImgUrl = that.data.seckillingOrderList.ProductImg,
            Phone = that.data.regionInfo.regionCellPhone,
            RegionId = that.data.regionInfo.regionId;
        let datas = {
            ActivitiesId: activityId,
            ActivityTag,
            Address,
            AdjustedFreight: freight,
            ProductId,
            ProductName,
            ProductNum,
            ProductImgUrl,
            Phone,
            Remark,
            ShipTo,
            ShippingModeId: shipModelId,
            ShippingModeName: shippingModeName,
            ShippingRegion: id,
            RegionId,
            SkuId,
            SkuName,
            Templateid: templateId,
            TotalMoney: total
        }
        wx.showLoading({
            title: '正在提交...',
        })
        app.request({
            url: '/Order/CreateOrder',
            requestDomain: 'seckilling_domain',
            data: datas,
            success(res) {
                const orderId = res.Data,
                    activityId = that.data.activityId,
                    ProductNum = that.data.seckillingOrderList.ProductNum,
                    skuId = that.data.skuId;
                if (res.Code == 0) {
                    // wx.redirectTo({
                    //     url: `../confirmorder/confirmorder?orderId=${orderId}`
                    // })
                    app.navigateTo(`../confirmorder/confirmorder?orderId=${orderId}`, 'redirectTo');
                } else {
                    wx.setStorage({
                        key: 'orderData',
                        data: JSON.stringify(datas)
                    })
                    util.showToast(that, {
                        text: '请稍等',
                        duration: 2000,
                        callBack() {
                            // wx.redirectTo({
                            //     url: `../seckillingDetail/seckillingDetail?status=1&activityId=${activityId}&skuId=${skuId}&selectedCount=${ProductNum}`
                            // })
                            app.navigateTo(`../seckillingDetail/seckillingDetail?status=1&activityId=${activityId}&skuId=${skuId}&selectedCount=${ProductNum}`, 'redirectTo');
                        }
                    });
                }
            },
            complete() {
                wx.hideLoading();
            }
        })
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
        app.buttomCopyrightSetData(this, false, 'close');
        this.setData({
            isProbationShop: wx.getStorageSync("storeType")
        })
        const that = this;
        filter.request({
            url: '/MemberAddress/GetDefaultAddress',
            data: {},
            success: function (res) {
                if (res.Code == 0 && res.Data != null) {
                    that.setData({
                        isSelectedAddress: true,
                        isAuthAddress: true,
                        regionInfo: {
                            regionProvince: res.Data.Province,
                            regionCity: res.Data.City,
                            regionCounty: res.Data.County,
                            regionStreet: res.Data.StreetName,
                            regionAddress: res.Data.Address,
                            regionId: res.Data.RegionId <= 0 ?res.Data.CityId:res.Data.RegionId,
                            regionMemberName: res.Data.ShipTo,
                            regionCellPhone: res.Data.CellPhone,
                            id: res.Data.Id,
                            Address: res.Data.Province + res.Data.City + res.Data.County + res.Data.StreetName + res.Data.Address
                        }
                    })
                    that.options.shippingId = res.Data.Id;
                } else {
                    that.options.shippingId = 0;
                }
                that.onLoad(that.options);
            }
        })
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