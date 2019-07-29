var filter = require('/utils/filter.js');
App({
    onLaunch: function (options) {
      var that = this;
      //获取授权模块
        that.request({
            url: '/Account/CheckAppBindAndExpired',
            data: {},
            success: function (res) {
                if (res.Code == 0) {
                    wx.setStorageSync('isClose', res.Data.expired);
                    if (res.Data.unauthorized) {
                        wx.redirectTo({
                            url: '/pages/unauthorized/unauthorized?shopcellphone=' + res.Data.shopcellphone
                        })
                    }
                }
            }
        });
        if (options.query.shopId && Number(options.query.shopId) > 0) { //处理锁粉逻辑
            if (wx.getStorageSync('shopId') == '') {
                wx.setStorageSync('shopId', options.query.shopId);
            }
        }
        if (options.query.scene && Number(options.query.scene) > 0) {//扫码掌柜名片进来的
            if (wx.getStorageSync('shopId') == '') {
                wx.setStorageSync('shopId', options.query.scene);
            }
        } else if (options.query.scene) {
        }
        /*登陆逻辑*/
        //this.getUserInfo();//登陆逻辑放到需要分享的页面中去，这样才能处理锁粉的逻辑
    },
    onShow: function () {
        var token = wx.getStorageSync('memberToken');
        var that = this;
        wx.removeStorageSync('isClose');
        wx.removeStorageSync('isOpenCopyRight');
        wx.removeStorageSync('copyRightLogo');
        wx.removeStorageSync('copyRightText');
        wx.removeStorageSync('requestStoreInfoSuccess');
        // //验证店铺是否关闭
        // that.request({
        //     url: '/Account/GetStoreIsClose',
        //     data: {},
        //     success: function (res) {
        //         if (res.Code == 0) {
        //             wx.setStorageSync('isClose', res.Data.IsClose);
        //         }
        //     }
        // });
        // //底部版权logo
        // that.request({
        //     url: '/Detail/GetStoreLogo',
        //     data: {},
        //     success: function (res) {
        //         if (res.Data) {
        //             if (res.Data.IsOpenCopyRight) wx.setStorageSync("isOpenCopyRight", res.Data.IsOpenCopyRight)
        //             if (res.Data.copyRightLogo) wx.setStorageSync("copyRightLogo", res.Data.copyRightLogo);
        //             if (res.Data.CopyRightText) wx.setStorageSync("copyRightText", res.Data.CopyRightText)
        //         }
        //     }
        // });
        //请求店铺信息
        that.request({
            url: '/Account/GetStoreBaseInfo',
            success(res) {
                if (res.Code == 0) {
                    wx.setStorageSync('isClose', res.Data.IsClose);
                    wx.setStorageSync("isOpenCopyRight", res.Data.IsOpenCopyRight)
                    wx.setStorageSync("copyRightLogo", res.Data.CopyRightLogo);
                    wx.setStorageSync("copyRightText", res.Data.CopyRightText);
                    wx.setStorageSync("storeType", res.Data.StoreTrialType);
                    wx.setStorageSync("requestStoreInfoSuccess", true);
                    wx.setStorageSync("SupplyShip", res.Data.SupplyShip);
                }
            }
        })
    },
    getUserInfo: function (callBack,getUserSuccessFn) {       
        var that = this;
        //调用登录接口
        wx.login({
            success: function (loginRes) {
                wx.getUserInfo({
                    success: function (successRes) { //同意授权，请求登陆接口，写入globalData数据
                        let { signature, rawData, encryptedData, iv, userInfo } = successRes;
                        that.requestLogin({
                            code: loginRes.code,
                            signature,
                            rawData,
                            encryptedData,
                            iv,
                            userInfo
                        }, getUserSuccessFn)
                    },
                    fail(){
                        if (callBack) callBack();
                    }
                })
            }
        })
    },
    requestLogin({ code, signature, rawData, encryptedData, iv, userInfo},callBack){
        const that=this;
        that.request({
            url: '/Account/MemberLogin',
            data: {
                code:code,
                signature: signature,
                rawData: rawData,
                encryptedData: encryptedData,
                iv: iv
            },
            method: 'POST',
            success: function (res) {
                let isDelete = false;
                if (res.Code == 100001 && res.Msg == "用户已删除") {
                    wx.setStorageSync('isDel', 1);
                    isDelete = true;
                }
                if (res.Code != 100001 || res.Msg != "用户已删除") {
                  wx.setStorageSync('isDel', 0);
                  isDelete = false;
                }
                if (res.Code == 9 && res.Data.expired) {
                    wx.reLaunch({
                        url: '/pages/error/error?errorStatus=600',
                    });
                    return;
                }
                if (res.Code != 0) { //获取令牌失败
                    wx.showToast({
											  title: res.Msg,
                        image: '/pages/images/prompt-icon.png',
                        duration: 2000
                    });
                    wx.removeStorageSync('memberToken');
                    wx.removeStorageSync('forcebind');
                    wx.setStorageSync('isLogin', false)
                    return;
                }
								
                wx.setStorageSync('permissions', res.Data.permissions);
                wx.setStorageSync('userInfo', userInfo)
                wx.setStorageSync('isLogin', true)
                wx.setStorageSync('memberToken', res.Data.memberToken);
                wx.setStorageSync('shopId', res.Data.shopId);
                wx.setStorageSync('forcebind', res.Data.forcebind);

                //若shopId>0获取店铺信息保存至全局用于分享
                that.saveShopInfo(res.Data.shopId);
                if (res.Data.forcebind) { //需要去强制绑定
                    wx.redirectTo({
                        url: '/pages/binduser/binduser'
                    });
                    return;
                }
                if (callBack) callBack();
            },
            fail: function (res) { //销客多接口出错
                wx.setStorageSync('isLogin', false)
            },
            complete() {
                wx.hideLoading()
            }
        });
    },
    memberQuit: function () {
        wx.setStorageSync('memberToken', '');
        this.globalData.userInfo = null;
        this.globalData.isLogin = false;
        this.globalData.refuseAuthFlag = true;
    },
    saveShopInfo: function (shopId) {
        var that = this;
        that.request({
            url: '/Detail/GetStoreInfo',
            data: {},
            success: function (saveRes) {
                if (saveRes.Code == 0) {
                    wx.setStorageSync('shopInfo', saveRes.Data);
                    wx.setNavigationBarTitle({
                        title: saveRes.Data.SiteName,
                    });
                }
            }
        });
    },
    permissions:[],
    globalData: {
        userInfo: null,
        isLogin: false,
        refuseAuthFlag: false,
        shopId: 0,
        shopInfo: null
    },
    isInited:false,
	  getPermissions:function(){
			let permissions = wx.getStorageSync('permissions');
			if (permissions == null || permissions.length<1){
				let configwxPermissions = wx.getExtConfigSync().permissions;
				permissions = configwxPermissions;
			}
			return permissions;
		},
    hasPermissions: function (moduleStr) {
			var permissionsList = this.getPermissions();
         return permissionsList.indexOf(moduleStr) > -1;           
    },
    backIndex: function () {
			  var permissionsList = this.getPermissions();
        if (permissionsList.indexOf('xkd_wxaapp') > -1) {
            wx.redirectTo({
                url: '/pages/index/index',
            })
        } else {
            wx.redirectTo({
                url: '/pages/pintuan/index/index',
            })
        }       
    },
    getPoster(parameter) {
        var equipmentInfo = null;
        wx.getSystemInfo({
            success: function (res) {
                equipmentInfo = res;
            }
        })
        var ctx = wx.createCanvasContext(parameter.canvasId);
        ctx.beginPath();
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, 0, 750, 1110);
        ctx.closePath()
        parameter.drawList.forEach(function (item, index) {
            switch (item.type) {
                case 'text':
                    ctx.save();
                    ctx.beginPath();
                    // if (item.text.length > item.maxLen) {
                    //   item.text = item.text.substr(0, item.maxLen) + '...';
                    // }
                    ctx.setFontSize(item.size);
                    ctx.setFillStyle(item.fillStyle);
                    if (index == 0) {
                        if (item.text.length > 24) {
                            var text = item.text.substr(0, item.maxLen);
                            var text2 = item.text.substr(24);
                            if (text2.length > 24) {
                                text2 = text2.substr(0, 24) + '...';
                            }
                            ctx.fillText(text, item.x, item.y);
                            ctx.closePath();
                            ctx.beginPath();
                            ctx.fillText(text2, item.x, item.y + 30);
                        } else {
                            ctx.fillText(item.text, item.x, item.y + 15);
                        }
                    }
                    else if (index == 3) {
                        if (item.text.length > 10) {
                            var text = item.text.substr(0, item.maxLen);
                            var text2 = item.text.substr(11);
                            ctx.fillText(text, item.x, item.y);
                            ctx.closePath();
                            ctx.beginPath();
                            ctx.fillText(text2, item.x, item.y + 45);
                        } else {
                            ctx.fillText(item.text, item.x, item.y);
                        }
                    } else {
                        ctx.fillText(item.text, item.x, item.y);
                    }
                    ctx.closePath()
                    break;
                case 'img':
                    ctx.save()
                    ctx.beginPath()
                    var defaultWidth = 750 - 40;//正方形宽度
                    ctx.rect(item.x, item.y, 710, 710);
                    ctx.setFillStyle('#ffffff')
                    ctx.fill();
                    ctx.clip();
                    item.h = (defaultWidth / item.w) * item.h;
                    item.w = defaultWidth;
                    ctx.drawImage(item.imgUrl, item.x, item.y, item.w, item.h);
                    ctx.restore();
                    ctx.closePath()
                    break;
                case 'qCode':
                    ctx.save();
                    ctx.beginPath();
                    ctx.drawImage(item.imgUrl, item.x, item.y, item.w, item.h);
                    ctx.closePath()
                    break;
                default:
                    break;
            }
        })
        ctx.draw();
        var posterImg = '';
        setTimeout(function () {
            wx.canvasToTempFilePath({
                canvasId: 'poster',
                fileType: 'jpg',
                success: function (res) {
                    posterImg = res.tempFilePath;
                    if (parameter.success) {
                        parameter.success(posterImg)
                    }
                }
            })
        }, 200)
    },
    request: function (options,form) {
        var that = this;
        var xkd_token = wx.getStorageSync('memberToken');
        var xkd_appId = wx.getExtConfigSync().wx_appid;
			console.log(xkd_appId);
        var xkd_shopId = wx.getStorageSync('shopId') ? wx.getStorageSync('shopId') : 0;
        var xkd_timeStamp = new Date().getTime().toString();
        var host_url = wx.getExtConfigSync()[options.requestDomain];
        var XcxRequestToken = wx.getStorageSync('Xcx-RequestToken') ? wx.getStorageSync('Xcx-RequestToken') : '';
        host_url = host_url ? host_url.url : wx.getExtConfigSync().default_domain.url;
        xkd_appId = xkd_appId ? xkd_appId : 'wx33bcca6aad8e3692';
        var dataArr = [];
        var sign = '';
        var postData = {};
        //var dataType = options.dataType ? options.dataType :'json';
        var method = options.method ? options.method : 'POST';
        for (var item in options.data) {
            var value = '';
            if (options.data[item] && options.data[item] instanceof Object) {
                value = JSON.stringify(options.data[item]);
            } else {
                value = options.data[item];
            }
            postData[item] = value;
            dataArr.push(item.toLowerCase() + "=" + value);
        }
        dataArr.sort();

        sign = dataArr.join('&');
        var headerData = {
            "content-type": options.contentType ? options.contentType : "application/x-www-form-urlencoded",
            "Xcx-Sign": filter.encryption(sign + xkd_appId + xkd_token + xkd_timeStamp),
            "Xcx-Appid": xkd_appId,
            "Xcx-ShopId": xkd_shopId,
            "Xcx-Membertoken": xkd_token,
            "Xcx-Timestamp": xkd_timeStamp,
            "Xcx-RequestToken": XcxRequestToken
        };
        if (options.requestType && options.requestType == 'upload') {//上传图片
            headerData['Xcx-UpFile'] = true;
            headerData['Xcx-Sign'] = filter.encryption(xkd_appId + xkd_token + xkd_timeStamp);
            wx.uploadFile({
                url: host_url + options.url,
                filePath: options.filePath,
                name: options.fileName,
                formData: options.formData,
                header: headerData,
                success: function (data) {
                    if (options.success) options.success(data.data)
                },
                fail: function (data) {
                    if (options.fail) options.fail(data.data);
                },
                complete: function (data) {
                    if (options.complete) options.complete(data.data);
                }
            })
        } else {//普通请求
            wx.request({
                url: host_url + options.url,
                data: postData,
                header: headerData,
                method: method,
                //dataType: dataType,
                success: function (data) {
                    if (data.data.Code == 1) {
                        //that.globalData.isLogin = false;
                        wx.removeStorageSync('isLogin');
                        wx.removeStorageSync('memberToken');
                        wx.removeStorageSync('userInfo')
                        var pages = getCurrentPages();
                        that.getUserInfo(function (){},function () {
                            var pages = getCurrentPages();
                            if (pages.length > 0) {
                                pages[0].onLoad(pages[0].options);
                                pages[0].onShow();
                            }
                        });
                    } else {
                        if (data.data.Code) {
                          if (data.data.Msg && options.url != '/Coupon/GetCouponRemind' && data.data.Msg != '订单失败正在排队' && data.data.Msg != '超出发送条数，请及时续费！' && !/^[0-9]*$/.test(data.data.Msg)) { 
                              if (form) return false;   
                                wx.showToast({
                                    title: data.data.Msg,
                                    image: '/pages/images/prompt-icon.png',
                                    duration: 2000,
                                    success: function () {
                                        if (options.success) options.success(data.data)
                                    }
                                });
                            } else {
                                if (options.success) options.success(data.data)
                            }
                        } else {
                            if (options.success) options.success(data.data)
                        }
                    }
                },
                fail: function (data) {
                    var pages = getCurrentPages();
                    if (pages[pages.length - 1].__route__.indexOf('/index/') < 0) {
                        wx.redirectTo({
                            url: '/pages/error/error?errorStatus=700',
                        })
                    } else {
                        wx.showToast({
                            title: '请求超时',
                            image: '/pages/images/prompt-icon.png',
                            duration: 2000
                        });
                    }
                    if (options.fail) options.fail(data.data);
                },
                complete: function (e) {
                    if(!form){//不是表单提交类型
                        if (e.statusCode == 404 || e.statusCode == 500 || e.statusCode == 503) {
                            wx.redirectTo({
                                url: '/pages/error/error?errorStatus=' + e.statusCode,
                            })
                        }
                    }
                    if (options.complete) options.complete(e.data);
                }
            })
        }

    },
    judgeLoginState: function (initDataFn) {
        if (!this.globalData.isLogin) {
            this.getUserInfo(function () {
                initDataFn();
            });
        } else {
            initDataFn();
        }
    },
    navigateTo: function (url, JumpType) {
        if (url == "#" || url == "") {
            return;
        }
        var newUrl = url.substr(1);
        var tabBarList = wx.getExtConfigSync()['tabBarList'] || ['sdfasddfhfgdhfhj'];
        if (tabBarList.indexOf(newUrl) > -1) {
            wx.switchTab({
                url: url,
                fail(err) {
                    wx.navigateTo({
                        url: '/pages/error/error?errorStatus=404'
                    })
                }
            })
        } else {
            if (JumpType == 'switchTab') {
                wx.navigateTo({
                    url: url,
                    fail(err) {
                        wx.navigateTo({
                            url: '/pages/error/error?errorStatus=404'
                        })
                    }
                })
            } else {
                wx[JumpType]({
                    url: url,
                    fail(err) {
                        wx.navigateTo({
                            url: '/pages/error/error?errorStatus=404'
                        })
                    }
                })
            }
        }
    },
    //设置底部版权与店铺关闭
    buttomCopyrightSetData: function (that, fixed,close) {
        that.data.copyright.logoSrc = wx.getStorageSync("copyRightLogo");
        that.data.copyright.isOpenCopyRight = wx.getStorageSync("isOpenCopyRight");
        that.data.copyright.copyRightText = wx.getStorageSync("copyRightText");
        if (fixed) that.data.copyright.position = 'copyright-fixed';
        if (close){
            that.setData({
                copyright: that.data.copyright,
                isClose: wx.getStorageSync("isClose")
            })
        }else{
            that.setData({
                copyright: that.data.copyright
            })
        }
    },
    sendFormIdTime:0,//上次发送时间
    isSendFormIding:false,//是否正在发起请求中
    sendFormId: function (formId,type) {
        const that=this;
        if (that.isSendFormIding) return false;
        that.isSendFormIding = true;
        let nowTime=new Date().getTime();
        if ((nowTime - that.sendFormIdTime) < 5 * 1000){
            that.isSendFormIding = false;
            return false;
        }
        that.request({
            url: '/WappApi/SendFormId',
            data: {
                formId: formId,
                type:type
            },
            complete:function (){
                that.isSendFormIding=false;
                that.sendFormIdTime = nowTime;
            }
        },'formSubmit')
    },
    hasShowGetCouponModal: function (target) {
      let isShow = wx.getStorageSync("isShowGetCouponModal");
      if (isShow) {
        if (isShow == 0) {
          target.setData({
            isShowCouponModal: true
          });
        }
      } else {
        this.request({
          url: '/Coupon/GetCouponRemind',//GetPrompt
          data: {},
          success: function (res) {
            if (res.Code == 0) {
              wx.setStorageSync('isShowGetCouponModal', 1)              
              res.Data.EndDate=res.Data.EndDate.substr(0, 10).replace(/[\-]/g, '.');
              res.Data.BeginDate = res.Data.BeginDate.substr(0, 10).replace(/[\-]/g, '.');
              target.setData({
                isShowCouponModal: true,
                couponData:res.Data
              })
            }
          }
        });
      }
    }
})