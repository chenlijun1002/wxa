// pages/detail/detail.js
//商品详情
var app = getApp();
var filter = app;
var util = require('../../utils/util.js');
var richText = require('../../utils/richText.js');
 var WxParse = require('../../wxparse/wxParse.js');
// var wxDiscode = require('../../wxparse/wxDiscode.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        interfaceOkCount: 0,
        IsPauseSale: false,
        productInfo: {
         
        },
        addressInfo: {

        },
        selectedSku: {
            selectedSkuImg: '',
            selectedSkuName: [],
            selectedSkuPrice: 0
        },
        productSku: {

        },
        regionInfo: {
            regionProvince: '',
            regionCity: '',
            regionCounty: '',
            regionAddress: ''
        },
        couponList: [],//优惠券
        timeLimitDiscount: {},//限时折扣信息
        buyOriginal: true,//是否原价购买，默认是true，限时折扣时设为false
        showCommission: false,//是否显示返佣
        timeLimitPrice: 0,
        showCoupons: false,//是否显示优惠券
        addressList: [],//收货地址列表
        selectedAddress: null,//选中的收货地址
        canDiscount: false,
        showAddress: '',
        selectedCount: 1,
        selectedSkuId: '',
        selectedSkuStock: 0,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        freight: '',
        animationData: null,
        extConfig: '',
        specifications: '',
        buyNow: false,
        goCart: false,
        isAddnum: 'hide',
        cartNum: 0,
        showCartNum: false,
        isShowToast: false,
        toastText: {},
        popupStatus: '',
        showCode: false,
        imagewidth: 0,//缩放后的宽  
        imageheight: 0,//缩放后的高
        imageSrc: '',
        storeId: 0,
        integralStatus: '',
        commentItems: [],
        images: [],
        isAnonymous: true,
        orderId: 0,
        skuId: 0,
        id: 0,
        evaContent: '',
        commentInfo: {},
        total: 0,
        goodRate: 0,
        copyright:{},
        nodes: [],
        isDel:false,
        ProductAttrs:[],
        types:0,
        autoplay:false,
        showVideo: false
    },
    timer:null,
    options: null,
    imageInfo: null,
    posterImg:'',
    productId:'',
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that=this;
        this.options = options;
        if (options.productId){
            this.setData({
                productId: options.productId
            })
        } else if (options.scene){
            var tempArr = options.scene.split('-');
            if (tempArr.length==2)
            {
                var productId = options.scene.split('-')[0].split('_')[1];
                var shopId = options.scene.split('-')[1].split('_')[1];
                this.setData({
                    productId: productId
                })
                if (wx.getStorageSync('shopId') == '') {
                    wx.setStorageSync('shopId', shopId);
                }

                options.productId = productId;

            }else{
                wx.showToast({
                    title: '非正常访问',
                })
            }
            
        }
        var that = this;
        var productId = options.productId;
        this.productId = productId;
        if (options.shopId) {//处理锁粉逻辑
            if (wx.getStorageSync('shopId') == '') {
                wx.setStorageSync('shopId', options.shopId);
            }
        }
        if (wx.getStorageSync('isLogin')) {
            this.setData({
                showAuthorization: false
            })
            that.initData(that, productId);
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.initData(that, productId);
            })
        }
    },
    getuserinfo: function () {
        this.initData(this, this.productId);
        this.setData({
            showAuthorization: false
        })
    },
    initData: function (that, productId){
        /*处理规格数据方法*/
        function getSkuData(sku) {
            var priceList = [];
            var skuData = [];
            var skuImgUrl = [];
            sku.forEach(function (item) {
                //不存储重复价格
                //if (priceList.indexOf(item.SalePrice) == -1){
                priceList.push(item.SalePrice.toFixed(2));
                skuImgUrl.push(item.SkuImgUrl);
                //}
                item.ProductSKU_Propertys.forEach(function (sub) {
                    // var data = { pid: sub.PId, pname: sub.PName, VName: sub.VName };
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
                                skuData[index].values.push({id:sub.Id,vid: sub.VId, vname: sub.VName });
                          }
                            status = false;
                      }
                      skuData[index].values.sort(sortId);
                    });
                    if (status) {
                      skuData.push({ pid: sub.PId, pname: sub.PName, values: [{id:sub.Id, vid: sub.VId, vname: sub.VName }] });
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

        /*实际数据*/
        //请求地址信息,回调中执行以下
        filter.request({
            url: '/Detail/GetProductDetail',
            data: {
                productId: productId
            },
            success: function (res) {
                //设置页面数据一定要用setData否则视图无法更新
                if (res.Code == 0) {
                    var interfaceCount = that.data.interfaceOkCount;
                    var skuSetData = getSkuData(res.Data.ProductSKU);
                    var skuName = [];
                    if (skuSetData.skuData.length > 0) {
                        skuName.push('请选择规格');
                    }
                    var productSku = res.Data.ProductSKU;
										if (res.Data.ImageUrls) {
											res.Data.ImageUrls.forEach((v, i) => {
												res.Data.ImageUrls[i] = v + "?x-oss-process=style/720";
											})
										}
										if (productSku) {
											productSku.forEach((v, i) => {
												v.SkuImgUrl = v.SkuImgUrl + "?x-oss-process=style/180";
											})
										}
                    if (res.Data.ProductDetail) {                      
                      var article = richText.go(filterSource(res.Data.ProductDetail));
                      var a = filterVideo(article);
                      var b = splitArr(a, article);                      
                      that.setData({
                        nodes: b
                      })                    
                    }
                    let MarketPrice = (res.Data.MarketPrice).toFixed(2);//商品价格
                    if (res.Data.ProductSKU.length>1){//如果为多规格商品取最低价格
                        res.Data.ProductSKU.sort(function (a,b){
                            return a.SalePrice - b.SalePrice;
                        })
                        console.log(res.Data.ProductSKU)
                        MarketPrice = res.Data.ProductSKU[0].SalePrice.toFixed(2);
                    }
                    that.setData({                        
                        posterShow: res.Data.IsShow,
                        IsPauseSale: res.Data.IsPauseSale,
                        storeId: res.Data.MerchantId,
                        interfaceOkCount: interfaceCount + 1,
                        productInfo: {
                            ImageUrls: res.Data.ImageUrls,
                            HasSKU: res.Data.HasSKU,
                            IsfreeShipping: res.Data.IsfreeShipping,
                            MarketPrice,
                            MinPrice:res.Msg,
                            OldPrice: (res.Data.OldPrice).toFixed(2),
                            ProductName: res.Data.ProductName,
                            SaleCounts: res.Data.SaleCounts,
                            ProductId: productId,
                            ProductSKU: skuSetData,
                            FreightTemplateId: res.Data.FreightTemplateId,
                            VideoUrl: res.Data.VideoUrl,
                            VideoImgUrl: res.Data.VideoImgUrl,
                        },
                        freight: '免运费',
                        selectedSku: {
                            selectedSkuPrice: MarketPrice,
                            selectedSkuImg: res.Data.ImageUrls[0],
                            selectedSkuName: skuName
                        },
                        productSku: productSku,
                        selectedSkuId: skuSetData.skuData.length > 0 ? '' : res.Data.ProductId,
                        selectedSkuId: skuSetData.skuData.length > 0 ? '' : res.Data.ProductId,
                        selectedSkuStock: res.Data.Stock
                    });
                    // util.contentShow(that, that.data.interfaceOkCount, 1);
                    //取运费和配送区域
                    var isfreeShipping = that.data.productInfo.IsfreeShipping;
                    if (wx.getStorageSync('isLogin')) {
                        app.request({
                            url: '/MemberAddress/GetAddressList',
                            data: {},
                            success(res) {
                                if (res.Code == 0) {
                                    that.setData({
                                        addressList: res.Data
                                    });
                                } else {
                                    util.showToast(that, {
                                        text: '获取收货地址列表接口异常' + res.Msg,
                                        duration: 2000
                                    });
                                }
                            },
                            complete(res) {
                                let addressList = that.data.addressList;
                                let defaultAddress = '';
                                let selectedAddress = '';
                                addressList.forEach(function (item, index) {
                                    if (item.IsDefault) {
                                        item.selected = true;
                                        defaultAddress = item;
                                        selectedAddress = item;
                                    } else {
                                        item.selected = false;
                                    }
                                });
                                that.setData({
                                    addressList: addressList,
                                    defaultAddress: defaultAddress,
                                    selectedAddress: selectedAddress
                                });
                                if (defaultAddress) {//有默认收货地址
                                    if (!isfreeShipping) {
                                        that.getFreight(defaultAddress);
                                    }
                                } else {//没有
                                    that.getNoDefaultFreight();
                                }
                            }
                        });
                    } else {
                        that.getNoDefaultFreight();
                    }
                }
                if (res.Code == 100002 && res.Msg =="商品已下架"){
                  that.setData({
                    isDel:true
                  })
                }
            },
            fail: function (res) {
                /* wx.showToast({
                wx.showToast({
                  title: '接口访问失败',
                  image: '../images/prompt-icon.png',
                  duration: 2000
                }) */
                util.showToast(that, {
                    text: '获取商品详情接口异常！' + res.Msg,
                    duration: 2000
                });
            },
            complete(res) {
                that.setData({ loadComplete: true });
                if (!wx.getStorageSync('isLogin')) {//再进行登陆逻辑
                    app.getUserInfo(function () {
                        that.getCartNum();//获取购物车数量
                        that.getCoupons(productId);//获取优惠券信息
                        that.getTimeLimitDiscount(productId);//获取限时折扣信息
                    });
                }
                if (wx.getStorageSync('isLogin')) {
                    that.getCartNum();//获取购物车数量
                    that.getCoupons(productId);//获取优惠券信息
                    that.getTimeLimitDiscount(productId);//获取限时折扣信息
                }
            }
        });
        //请求商品属性
        filter.request({
          url:'/Product/GetProductAttrs',
          data: {
            productId: productId
          },
          success:function(res){
            if(res.Code==0){
              that.setData({
                ProductAttrs: res.Data
              })
            }
          },
          fail:function(){

          },
          complete:function(){

          }
        })
        //请求评论数据
        filter.request({
            url: '/Detail/NewTop2CommentLists',
            data: {
                productId: productId
            },
            success: function (res) {
                if (res.Code == 0) {
                    var jsonData = JSON.parse(res.Data);
                    that.setData({
                        commentItems: jsonData.data,
                        total: jsonData.total,
                        goodRate: jsonData.total > 0 ? (jsonData.startcount / jsonData.total * 100).toFixed(2) : 0
                    })
                }
            }
        })
    },
    onShow: function () {
        var that = this;
        if (wx.getStorageSync("requestStoreInfoSuccess")) {
            app.buttomCopyrightSetData(this);
            that.setData({
                isProbationShop: wx.getStorageSync("storeType")
            })
        } else {
            setTimeout(function () {
                app.buttomCopyrightSetData(that);
                that.setData({
                    isProbationShop: wx.getStorageSync("storeType")
                })
            }, 2000)
        }
        var shopInfo = wx.getStorageSync('shopInfo');
        if (shopInfo) {
            wx.setNavigationBarTitle({
                title: shopInfo.SiteName,
            });
        }
        var forceBind = wx.getStorageSync('forceBind');
        if (forceBind) {
            app.navigateTo('../binduser/binduser', 'redirectTo');
        }
    },
    onHide:function(){
      clearInterval(this.timer);
    },
    onUnload:function(){
      clearInterval(this.timer);
    },
    /**
     * 获取有选中地址时运费
     */
    getFreight(selectedAddress, cb) {
        let that = this;
        let freightTemplateId = this.data.productInfo.FreightTemplateId
        let productId = this.data.productInfo.ProductId;
        let productNum = parseInt(this.data.selectedCount);
        let price = parseFloat(this.data.productInfo.MarketPrice);
        app.request({
            url: '/Detail/GetPreFreight',
            data: {
                cityId: selectedAddress.CityId,
                countyId: selectedAddress.RegionId,
                freightTemplateId: freightTemplateId,
                productId: productId,
                productNum: productNum,
                provinceId: selectedAddress.ProvinceId,
                streetId: selectedAddress.StreetId,
                sumPrice: price * productNum
            },
            success(res) {
                if (res.Code == 0) {
                    that.setData({
                        freight: res.Data
                    });
                } else {
                    util.showToast(that, {
                        text: '获取预估运费接口异常' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete(res) {
                //执行回调
                if (cb && typeof cb == 'function') cb();
            }
        });
    },
    /**
     * 获取没有默认收货地址时运费
     */
    getNoDefaultFreight(cb) {
        //1.同意定位
        //取定位地址计算运费
        //2.不同意定位
        //取北京市东城区东华门街道作为地址计算运费
        let that = this;
        wx.getLocation({
            success: function (res) {
                var latitude = res.latitude
                var longitude = res.longitude
                app.request({
                    url: '/Detail/CalcAddressByCoordinate',
                    data: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    success(lRes) {
                        if (lRes.Code == 0) {
                            let selectedAddress = {
                                ProvinceId: lRes.Data.ProvinceId,
                                CityId: lRes.Data.CityId,
                                RegionId: lRes.Data.CountyId,
                                StreetId: 0,
                                ProvinceName: lRes.Data.ProvinceName,
                                CityName: lRes.Data.CityName,
                                CountyName: lRes.Data.CountyName,
                                StreetName: '',
                                Address: lRes.Data.Address
                            };
                            that.setData({
                                selectedAddress: selectedAddress
                            });
                            let isfreeShipping = that.data.productInfo.IsfreeShipping;
                            if (!isfreeShipping) {
                                that.getFreight(selectedAddress);
                            }
                        } else {
                            util.showToast(that, {
                                text: '坐标转换接口异常' + res.Msg,
                                duration: 2000
                            });
                        }
                    }
                });
            },
            fail: function (res) {
                let selectedAddress = {
                    ProvinceId: 642,
                    CityId: 643,
                    RegionId: 644,
                    StreetId: 64401,
                    ProvinceName: '北京市',
                    CityName: '北京市',
                    CountyName: '东城区',
                    StreetName: '东华门街道'
                };
                that.setData({
                    selectedAddress: selectedAddress
                });
                let isfreeShipping = that.data.productInfo.IsfreeShipping;
                if (!isfreeShipping) {
                    that.getFreight(selectedAddress);
                }
            },
            complete: function (res) {
                //执行回调
                if (cb && typeof cb == 'function') cb();
            }
        });
    },
    /**
     * 获取优惠券信息
     */
    getCoupons: function (productId) {
        let that = this;
        filter.request({
            url: '/Detail/GetTop3Coupons',
            data: {
                productId: productId
            },
            success: (res) => {
                if (res.Code == 0) {
                    that.setData({
                        couponList: res.Data
                    });
                } else {
                    util.showToast(that, {
                        text: '接口异常' + res.Msg,
                        duration: 2000
                    });
                }
            }
        });
    },
    /**
     * 获取限时折扣信息
     */
    getTimeLimitDiscount: function (productId) {
        let that = this;
        filter.request({
            url: '/Detail/GetTimeLimitDiscount',
            data: {
                productId: productId
            },
            success: (res) => {
                if (res.Code == 0) {
                    that.setData({
                        timeLimitDiscount: res.Data
                    });
                    that.setCommissionValue();
                    //限时折扣的商品不能加购物车，处理好这块逻辑，只能立即购买,显示原价购买按钮
                    //buyOriginal: false
                    //timeLimitPrice:...
                    if (res.Data.Commission > 0) {
                        that.setData({
                            showCommission: true
                        });
                    }
                    if (res.Data.CanDiscount) {
                        //不显示优惠券
                        that.setData({
                            canDiscount: true,
                            showCoupons: false,
                            buyOriginal: false,
                            timeLimitPrice: res.Data.ActivityPrice.toFixed(2)
                        });
                    } else {
                        //显示优惠券
                        that.setData({
                            showCoupons: true,
                            buyOriginal: true
                        });
                    }
                } else {
                    util.showToast(that, {
                        text: '接口异常' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete() {
                if (!that.data.buyOriginal) {//原价购买的不管
                    let selectedSku = that.data.selectedSku;
                    selectedSku.selectedSkuPrice = that.data.timeLimitPrice;
                    that.setData({
                        selectedSku: selectedSku
                    });
                }
            }
        });
    },
    /**
     * 领取优惠券
     */
    receiveCoupon(e) {
        let that = this;
        let couponId = e.currentTarget.dataset.couponid;
        let isUsed = e.currentTarget.dataset.isused;
        if (!isUsed) {
            return;
        }
        wx.showLoading({
            title: '领取中'
        });
        filter.request({
            url: '/Detail/ReceiveCoupon',
            data: {
                id: couponId
            },
            success: (res) => {
                if (res.Code == 0 && res.Data) {
                    util.showToast(that, {
                        text: '领取成功',
                        successIcon: true,
                        duration: 2000,
                        callBack: function () {
                            that.closeCouponPopup();
                        }
                    });
                } else {
                    util.showToast(that, {
                        text: '领取失败' + res.Msg,
                        duration: 2000
                    });
                }
            },
            complete: (res) => {
                wx.hideLoading();
            }
        });
    },
    /**
     * 原价购买
     */
    buyOriginal: function () {
        //buyOriginal:true
        let showCoupons = false;
        if (this.data.canDiscount) {//若之前获取到用户可以优惠，在点击原价购买时再把优惠券按钮显示出来
            showCoupons = true;
        }
        this.data.selectedSku.selectedSkuPrice = this.data.productInfo.MarketPrice;
        this.data.timeLimitDiscount.CanDiscount=false;
        this.setData({
            showCoupons: showCoupons,
            buyOriginal: true,
            timeLimitDiscount: this.data.timeLimitDiscount,
            selectedSku: this.data.selectedSku
        });
        this.setCommissionValue();
    },
    imageLoad0: function (e) {
        this.imageInfo = {
            width: e.detail.width,
            height: e.detail.height
        };
    },
    showVideoClick: function(){
      this.setData({ showVideo: true }); 
    },
    exitVideo: function(){
      this.setData({ showVideo: false }); 
    },
    /**
    * 显示商品海报
    */
    showCode: function () {
        var that = this;
        if (that.posterImg){
            wx.previewImage({
                urls: [that.posterImg]
            });
            return false;
        }
        wx.showLoading({
            title: '海报生成中~',
        });
        var shopId = wx.getStorageSync('shopId');
        var imgUrl = wx.getExtConfigSync().default_domain.url + "/XcxImg/GetWxaProductQrCode?id=" + that.data.productInfo.ProductId +
            "&shopId=" + shopId +
            "&storeid=" + that.data.storeId+
            "&random="+Math.random()*10000;

        // wx.hideLoading();
        var productImg = wx.getExtConfigSync().default_domain.url + "/XcxImg/GetPimg?id=" + encodeURIComponent(that.data.productInfo.ImageUrls[0] +'?x-oss-process=style/640') +'&random='+Math.random()*10000;

        var num=0;
        wx.downloadFile({
          url: productImg,
          success:function (res){
            if (res.statusCode === 200){
              productImg = res.tempFilePath;
              num += 1;
            }            
          }
        });
        wx.downloadFile({
          url: imgUrl,
          success: function (res) {
            if (res.statusCode === 200) {
              imgUrl = res.tempFilePath;
              num += 1;
            }   
          }
        });
        filter.request({
          url: '/Detail/GetProductPosterTips',
          data: {},
          success: (res) => {
            if (res.Code == 0) {             
              that.setData({ ProductDes: res.Data }); 
              num += 1;             
            }
          }
        });
        that.timer=setInterval(function(){    
          if(num==3){            
            //clearInterval(that.timer);            
            var drawList = [{
              type: 'text',
              fillStyle: '#000000',
              text: that.data.productInfo.ProductName,
              size: 29,
              maxLen: 24,
              x: 20,
              y: 50
            }, {
              type: 'img',
              imgUrl: productImg,
              x: 20,
              y: 100,
              w: that.imageInfo.width,
              h: that.imageInfo.height
            }, {
              type: 'text',
              fillStyle: '#00A699',
              text: '￥' + that.data.productInfo.MinPrice,
              size: 52,
              maxLen: 15,
              x: 280,
              y: 950
            }, {
              type: 'text',
              fillStyle: '#999999',
              text: that.data.ProductDes+ '',
              size: 36,
              maxLen: 11,
              x: 290,
              y: 1010
            },{
              type: 'qCode',
              imgUrl: imgUrl,
              x: 20,
              y: 835,
              w: 250,
              h: 250
            }];
            clearInterval(that.timer); 
            app.getPoster({
              canvasId: 'poster',
              drawList: drawList,
              success: function (res) {
                that.posterImg = res;
                wx.hideLoading();
                wx.previewImage({
                  urls: [res]
                });                
              }
            });
          }
        },500)       
    },
    hideCode: function () {      
        this.setData({
            showCode: false
        })
    },
    getCartNum: function () {
        var that = this;
        filter.request({
            url: '/ShopCart/GetShopCartNum',
            data: {},
            success: function (res) {
                if (res.Code == 0) {
                    var num = res.Data;
                    var show = false;
                    if (num > 0) {
                        show = true;
                    }
                    that.setData({
                        cartNum: res.Data,
                        showCartNum: show
                    });
                }
            }
        });
    },
    imagesPreview: function (e) {
        var imgPath = (e.currentTarget.dataset.images);
        var currentImg = e.target.dataset.target;
        wx.previewImage({
            current: currentImg, // 当前显示图片的http链接
            urls: imgPath // 需要预览的图片http链接列表
        })
    },
    onShareAppMessage: function () {
        var that = this;
        var productName = this.data.productInfo.ProductName;
        var shopInfo = wx.getStorageSync('shopInfo');
        var siteName = shopInfo ? shopInfo.SiteName : '';
        var shopId = wx.getStorageSync('shopId');
        return {
            title: productName,
            path: '/pages/detail/detail?productId=' + that.data.productInfo.ProductId + '&shopId=' + shopId,
            imageUrl: that.data.productInfo.ImageUrls[0],
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    selectSpecifications: function () {
        this.setData({
            specifications: 'show',
            buyNow: true,
            goCart: false
        })
    },
    showCouponPopup() {
        this.getCoupons(this.data.productInfo.ProductId);
        this.setData({ popupStatus: 'show' })
    },
    closeCouponPopup() {
        this.setData({ popupStatus: '' })
    },
    closePopup: function () {
        this.setData({
            specifications: 'hide'
        })
    },
    closeIntegral: function () {
        this.setData({
            integralStatus: 'hide'
        })
    },
    showIntegral: function () {
        this.setData({
            integralStatus: 'show'
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

        var thisData = this.data;
        this.data.productSku.forEach(function (item, index) {
            var attrInnerData = [];
            item.ProductSKU_Propertys.forEach(function (item1, index1) {
                attrInnerData.push(item1.VName);
            })
            if (attrInnerData.toString() == thisData.selectedSku.selectedSkuName.toString()) {
                if (thisData.buyOriginal) {
                    thisData.selectedSku.selectedSkuPrice = item.SalePrice.toFixed(2);
                    that.data.productInfo.MarketPrice = item.SalePrice.toFixed(2);
                } else {
                    thisData.selectedSku.selectedSkuPrice = thisData.timeLimitPrice;
                    that.data.productInfo.MarketPrice = thisData.timeLimitPrice;
                }
                // thisData.selectedSku.selectedSkuPrice = item.SalePrice.toFixed(2);
                thisData.selectedSku.selectedSkuImg = item.SkuImgUrl;
                thisData.selectedSkuId = item.SkuId;
                thisData.selectedSkuStock = item.Stock;
            }
        });
        var productInfo = this.data.productInfo;
        var selectedSku = this.data.selectedSku;
        this.setData({
            productInfo: productInfo,
            selectedSku: selectedSku,
            selectedSkuStock: thisData.selectedSkuStock
        });
        this.setCommissionValue();
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
        if (count > this.data.selectedSkuStock) {
            count--;
        }
        this.setData({
            selectedCount: count
        });
    },
    validateCount: function (e) {
        var count = parseInt(e.detail.value);
        if (count == 0) {
            count = 1;
        }
        if (count > this.data.selectedSkuStock) {
            count = this.data.selectedSkuStock;
        }
        this.setData({
            selectedCount: count
        });
    },
    blurValidateCount: function (e) {
        if (!e.detail.value) e.detail.value = 1;
        var count = parseInt(e.detail.value);
        if (count == 0) {
            count = 1;
        }
        this.setData({
            selectedCount: count
        });
    },
    buyNow: function () {//立即购买
        if (app.globalData.refuseAuthFlag) {//判断是否拒绝了授权，未授权则拉起再次授权
            //app.pullAuthAgain(getCurrentPages(), 'no', null);
            util.showToast(this, {
                text: '未授权登录的用户',
                duration: 2000
            });
            return;
        } else {
            if (!wx.getStorageSync('isLogin')) {
                // wx.redirectTo({
                //     url: '../index/index'
                // });
                app.navigateTo('/pages/index/index', 'redirectTo');
                return;
            }
            if (this.data.IsPauseSale) {
                util.showToast(this, {
                    text: '该商品已停售，无法加入购物车！',
                    duration: 2000
                });
                return;
            }
            if (this.data.productInfo.ProductSKU.skuData.length > 0 && this.data.selectedSkuId == '') {//有规格且没有选择规格则弹出提示
                util.showToast(this, {
                    text: '请选择商品规格！',
                    duration: 2000
                });
                return;
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
            //限时折扣的需要判断购买数量不能超出剩余可购数量
            //判断是否是限时折扣购买的商品，限时折扣的商品要加额外参数去下个页面
            if (this.data.buyOriginal) {//原价购买的
                // wx.redirectTo({
                //     url: '../confirmorder/confirmorder?type=submitbuy&productId=' + this.data.productInfo.ProductId + '&skuId=' + this.data.selectedSkuId + '&selectedCount=' + this.data.selectedCount + '&isTimeLimit=0'
                // });
                app.navigateTo('../confirmorder/confirmorder?type=submitbuy&productId=' + this.data.productInfo.ProductId + '&skuId=' + this.data.selectedSkuId + '&selectedCount=' + this.data.selectedCount + '&isTimeLimit=0', 'redirectTo');
                return;
            } else {
                if (Number(this.data.selectedCount) > Number(this.data.timeLimitDiscount.MaxNum)) {
                    util.showToast(this, {
                        text: '不能超出限购数量！',
                        duration: 2000
                    });
                    return;
                }
                // wx.redirectTo({
                //     url: '../confirmorder/confirmorder?type=submitbuy&productId=' + this.data.productInfo.ProductId + '&skuId=' + this.data.selectedSkuId + '&selectedCount=' + this.data.selectedCount + '&isTimeLimit=1'
                // });
                app.navigateTo('../confirmorder/confirmorder?type=submitbuy&productId=' + this.data.productInfo.ProductId + '&skuId=' + this.data.selectedSkuId + '&selectedCount=' + this.data.selectedCount + '&isTimeLimit=1', 'redirectTo');
                return;
            }
            // wx.redirectTo({
            //     url: '../confirmorder/confirmorder?type=submitbuy&productId=' + this.data.productInfo.ProductId + '&skuId=' + this.data.selectedSkuId + '&selectedCount=' + this.data.selectedCount
            // });
            app.navigateTo('../confirmorder/confirmorder?type=submitbuy&productId=' + this.data.productInfo.ProductId + '&skuId=' + this.data.selectedSkuId + '&selectedCount=' + this.data.selectedCount, 'redirectTo');
        }
    },
    goIndex: function () {
        app.navigateTo('/pages/index/index', 'switchTab');
    },
    goShopCart: function () {
        app.navigateTo('/pages/shopcart/shopcart', 'switchTab');
    },
    addCart: function () {
        if (this.data.IsPauseSale) {
            util.showToast(this, {
                text: '该商品已停售，无法加入购物车！',
                duration: 2000
            });
            return;
        }
        this.setData({
            specifications: 'show',
            buyNow: false,
            goCart: true
        })
    },
    goCart: function () {//添加进购物车    
        var that = this;
        if (app.globalData.refuseAuthFlag) {//判断是否拒绝了授权，未授权则拉起再次授权
            /*app.pullAuthAgain(getCurrentPages(), 'no', null, function () {
              that.getCartNum()
            });*/
            util.showToast(this, {
                text: '未授权登录的用户',
                duration: 2000
            });
            return;
        } else {
            if (!wx.getStorageSync('isLogin')) {
                // wx.redirectTo({
                //     url: '../index/index'
                // });
                app.navigateTo('/pages/index/index', 'redirectTo');
                return;
            }
            if (this.data.productInfo.ProductSKU.skuData.length > 0 && this.data.selectedSkuId == '') {//有规格且没有选择规格则弹出提示
                util.showToast(this, {
                    text: '请选择商品规格！',
                    duration: 2000
                });
                return;
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
            filter.request({
                url: '/ShopCart/AddProduct',
                data: {
                    productId: that.data.productInfo.ProductId,
                    skuId: that.data.selectedSkuId,
                    count: that.data.selectedCount
                },
                success: function (res) {
                    if (res.Code == 0) {
                        //todo:添加成功的逻辑
                        util.showToast(that, {
                            text: '添加成功',
                            successIcon: true,
                            duration: 2000
                        })
                        that.setData({
                            specifications: 'hide'
                        });
                        setTimeout(function () {
                            that.setData({
                                isAddnum: 'show'
                            });
                            setTimeout(function () {
                                that.setData({
                                    isAddnum: 'hide',
                                    cartNum: res.Data,
                                    showCartNum: true
                                });
                            }, 1000)
                        }, 400)
                    } else {
                        //添加失败
                        util.showToast(that, {
                            text: '添加失败' + res.Msg,
                            duration: 2000
                        });
                    }
                }
            });
        }
    },
    /**
     * 打开选择收货地址弹窗
     */
    selectAddress() {
        this.setData({
            showAddress: 'show'
        });
    },
    /**
     * 关闭选择收货地址弹窗
     */
    closeAddressPopup() {
        this.setData({
            showAddress: ''
        });
    },
    /**
     * 选择地址
     */
    changeAddress(e) {
        let isfreeShipping = this.data.productInfo.IsfreeShipping;
        let index = parseInt(e.currentTarget.dataset.index);
        let addressList = this.data.addressList;
        let selectedAddress = this.data.selectedAddress;
        addressList.forEach(function (item, aindex) {
            item.selected = false;
            if (aindex == index) {
                item.selected = true;
                selectedAddress = item;
            }
        });
        this.setData({
            selectedAddress: selectedAddress,
            addressList: addressList
        });
        this.closeAddressPopup();
        if (!isfreeShipping) {
            this.getFreight(selectedAddress);
        }
    },
    /**
     * 设置返佣金额
     */
    setCommissionValue() {
        let commissionRate = parseFloat(this.data.timeLimitDiscount.Commission);
        let LimitCommissionRate = parseFloat(this.data.timeLimitDiscount.LimitCommission);
        let productPrice = parseFloat(this.data.selectedSku.selectedSkuPrice);
        let commissionNum = (productPrice * commissionRate);
        let commission = commissionNum.toFixed(2); 
        let MarketPrice = parseFloat(this.data.productInfo.MarketPrice);
        let MarketCommission=(productPrice * commissionRate).toFixed(2);
        if (this.data.productInfo.ProductSKU){
          var priceSort = this.data.productInfo.ProductSKU.priceList.sort(function (a, b)           {
            return a - b;
          });
        }
        // //判断是否有多规格
        // if (this.data.productInfo.ProductSKU.skuData.length > 0) {//有多规格
        //     if (this.data.selectedSkuId != '') {//已选中规格
        //         this.setData({
        //             CommissionValue: '￥' + commission
        //         });
        //     } else {//未选中规格
        //         if (priceSort[0] == priceSort[priceSort.length - 1]){
        //             this.setData({
        //                 CommissionValue: '￥' + commission
        //             });
        //         }else{
        //             this.setData({
        //                 CommissionValue: '￥' + (priceSort[0] * commissionRate).toFixed(2) + "~￥" + (priceSort[priceSort.length - 1] * commissionRate).toFixed(2)
        //             });
        //         }
        //     }
        // } else {//没有多规格
        //     this.setData({
        //         CommissionValue: '￥' + commission
        //     });
        // }
        if (this.data.timeLimitDiscount.CanDiscount){
          let ActivityPrice = parseFloat(this.data.timeLimitDiscount.ActivityPrice);
          this.setData({
            CommissionValue: '￥' + (ActivityPrice * LimitCommissionRate).toFixed(2)
          });        
        }else{
          if ( this.data.selectedSkuId == '') {
            if (priceSort && (priceSort[0] != priceSort[priceSort.length - 1])){
             this.setData({
               CommissionValue: '￥' + (priceSort[0] * commissionRate).toFixed(2) + "~￥" + (priceSort[priceSort.length - 1] * commissionRate).toFixed(2)
             });
           }else{
              this.setData({
                CommissionValue: '￥' + (priceSort[0] * commissionRate).toFixed(2)
              });
           }
          } else {
            this.setData({
              CommissionValue: '￥' + commission
            });
          }
        }
    },
    lookCommentDetail: function () {
        // wx.navigateTo({
        //     url: '../../pages/comment/comment?productId=' + this.data.productId,
        // })
        app.navigateTo('../../pages/comment/comment?productId=' + this.data.productId, 'navigateTo');
    },
    navigate:function(e){
      if (e.target.dataset.index==0){
        app.navigateTo('/pages/index/index', 'navigateTo');
      } else if (e.target.dataset.index==1){
        app.navigateTo('/pages/membercenter/membercenter', 'navigateTo');
      }else{
        app.navigateTo('/pages/shopcart/shopcart', 'navigateTo');
      }
    },
    // 商品详情tab切换
    tabDetail:function(e){
      let types = e.currentTarget.dataset.types;
      this.setData({
        types: types
      })      
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    playVideo:function(e){
      this.setData({
        autoplay:false
      })      
    },
    endVideo:function(e){
      this.setData({
        autoplay: true,
        showVideo: false
      }) 
    }
})
// 保留两位小数
function toDecimal2(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return false;
    }
    var f = Math.round(x * 100) / 100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;
}
// 数组排序
function ArraySort(array) {
    if (!array) return;
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array.length - i - 1; j++) {
            if (array[j] > array[j + 1]) {
                var temp = array[j + 1];
                array[j + 1] = array[j];
                array[j] = temp;
            }
        }
    }
    return array;
}



// function splitArr(arr1,arr2){
//   var arr=[];
//   arr1.forEach(function(item){
//     arr2[item.parentIdx].children.splice(item.Index,1);
//     arr2[item.parentIdx+1].children.splice(item.Index, 1);
//   });
//   return arr2;
// }

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

function filterSource(str){
  var reg = /<source.*?\/>/g;  
  str = str.replace(reg, '');
  return str;
}
//对象排序的方法
function sortId(a, b) {
  return a.id - b.id
}