// evaluation.js
var app = getApp();
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        positionBottom: 'position-bottom',
        isLogo: wx.getStorageSync("IsOpenCopyRight"),
        logoSrc: wx.getStorageSync("copyRightLogo"),
        status: 1,
        selectIndex: 5,
        starText: '很好',
        star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
        star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
        star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
        star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
        star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
        imgPath: [],
        images: [],
        isAnonymous: true,
        orderId: 0,
        skuId: 0,
        id: 0,
        evaContent: '',
        commentInfo: {},
        copyright: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        var that = this;
        that.setData({
            status: options.status,
            orderId: options.orderId,
            skuId: options.skuId,
            id: options.id
        })
        if (wx.getStorageSync('isLogin')) {
            that.initData();
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.initData();
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
        var that = this;
        if (that.data.status == 1) {
            app.request({
                url: '/MemberCenter/GetOneToEvaluate',
                data: {
                    id: this.data.id,
                    skuId: this.data.skuId,
                    orderId: this.data.orderId
                },
                success: function (res) {
                    if (res.Code == 0) {
                        that.setData({
                            loadComplete: true
                        })
                        var arr = [];
                        var Arr = [res.Data.ImageUrl1, res.Data.ImageUrl2, res.Data.ImageUrl3, res.Data.ImageUrl4, res.Data.ImageUrl5, res.Data.ImageUrl6, res.Data.ImageUrl7, res.Data.ImageUrl8];
                        for (var i = 0; i < 8; i++) {
                            if (Arr[i] != null && Arr[i] != "") {
                                arr.push(Arr[i])
                            }
                        }

                        if (res.Data.StarRating == 1) {
                            that.setData({
                                starText: '差',
                                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png'
                            })
                        } else if (res.Data.StarRating == 2) {
                            that.setData({
                                starText: '差',
                                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png'
                            })
                        } else if (res.Data.StarRating == 3) {
                            that.setData({
                                starText: '一般',
                                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png'
                            })
                        } else if (res.Data.StarRating == 4) {
                            that.setData({
                                starText: '好',
                                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png'
                            })
                        } else if (res.Data.StarRating == 5) {
                            that.setData({
                                starText: '很好',
                                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png'
                            })
                        }
                        that.setData({
                            images: arr,
                            commentInfo: res.Data
                        })
                    }
                }
            })
        } else {
            app.request({
                url: '/MemberCenter/GetOneToEvaluate',
                data: {
                    id: this.data.id,
                    skuId: this.data.skuId,
                    orderId: this.data.orderId
                },
                success: function (res) {
                    if (res.Code == 0) {
                        that.setData({
                            commentInfo: res.Data,
                            loadComplete: true
                        })
                    }
                }
            })
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
    },
    textareaBlur: function (e) {
        this.setData({
            evaContent: e.detail.value
        });
    },
    back: function () {
        // wx.redirectTo({
        //     url: '../toComment/toComment',
        // })
        app.navigateTo('../toComment/toComment', 'redirectTo');
    },
    submit: function () {
        var that = this;
        this.setData({ evaContent: filteremoji(this.data.evaContent) });        
        var obj = {
            StarRating: that.data.selectIndex,
            orderId: that.data.orderId,
            skuId: that.data.skuId,
            id: that.data.id,
            isAnonymous: that.data.isAnonymous,
            evaContent: that.data.evaContent,
        };
        var pics = that.data.imgPath;
        var xkd_token = wx.getStorageSync('memberToken');
        var xkd_appId = wx.getExtConfigSync().wx_appid;
        var a = wx.getStorageSync("Xcx-Appid");
        if (that.data.evaContent.length < 5) {
            util.showToast(that, {
                text: '评论不能少于5个字',
                duration: 2000
            });
            return;
        }
        if (that.data.evaContent.length > 800) {
            util.showToast(that, {
                text: '评论不能超过800个字',
                duration: 2000
            });
            return;
        }
        wx.showLoading({
            title: '提交中，请稍后'
        });                
        that.uploadimg({
            url: wx.getExtConfigSync().default_domain.url + '/MemberCenter/UploadBase64Files',//这里是你图片上传的接口
            path: pics//这里是选取的图片的地址数组
        }, that);
        // app.request({
        //   url: '/MemberCenter/Comments',
        //   // requestDomain: 'seckilling_domain'
        //   data: {
        //     pics0: pics.length > 0 ? pics[0] : "",
        //     pics1: pics.length > 1 ? pics[1] : "",
        //     pics2: pics.length > 2 ? pics[2] : "",
        //     pics3: pics.length > 3 ? pics[3] : "",
        //     pics4: pics.length > 4 ? pics[4] : "",
        //     pics5: pics.length > 5 ? pics[5] : "",
        //     pics6: pics.length > 6 ? pics[6] : "",
        //     pics7: pics.length > 7 ? pics[7] : "",
        //     StarRating: that.data.selectIndex,
        //     orderId: that.data.orderId,
        //     skuId: that.data.skuId,
        //     id: that.data.id,
        //     isAnonymous: that.data.isAnonymous,
        //     evaContent: that.data.evaContent
        //   },
        //   success: function (res){
        //     if (res.Code == 0) {
        //       util.showToast(that, {
        //         text: '评价成功',
        //         duration: 2000
        //       });
        //       setTimeout(function(){
        //         wx.redirectTo({
        //           url: '../toComment/toComment',
        //         })
        //       },2000)
        //     }
        //   }
        // })
    },
    callback: function () {
        var that = this;
        var pics = that.arr;
        app.request({
            url: '/MemberCenter/Comments',
            // requestDomain: 'seckilling_domain'
            data: {
                pics0: pics.length > 0 ? pics[0] : "",
                pics1: pics.length > 1 ? pics[1] : "",
                pics2: pics.length > 2 ? pics[2] : "",
                pics3: pics.length > 3 ? pics[3] : "",
                pics4: pics.length > 4 ? pics[4] : "",
                pics5: pics.length > 5 ? pics[5] : "",
                pics6: pics.length > 6 ? pics[6] : "",
                pics7: pics.length > 7 ? pics[7] : "",
                StarRating: that.data.selectIndex,
                orderId: that.data.orderId,
                skuId: that.data.skuId,
                id: that.data.id,
                isAnonymous: that.data.isAnonymous,
                evaContent: that.data.evaContent
            },
            success: function (res) {
                if (res.Code == 0) {
                    wx.hideLoading();
                    util.showToast(that, {
                        text: '评价成功',
                        duration: 2000
                    });
                    setTimeout(function () {
                        // wx.redirectTo({
                        //     url: '../toComment/toComment',
                        // })
                        app.navigateTo('../toComment/toComment', 'redirectTo');
                    }, 2000)
                }
            }
        })
    },
    isAnonymous: function () {
        if (this.data.isAnonymous) {
            this.setData({
                isAnonymous: false
            })
        } else {
            this.setData({
                isAnonymous: true
            })
        }
    },
    changeStar: function (e) {
        var that = this;
        var state = Number(e.target.dataset.index);
        //if (that.parameter.status == state) return false;  //如果是点击的是当前的直接不处理
        if (state == 1) {
            this.setData({
                selectIndex: state,
                starText: '差',
                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png'
            })
        } else if (state == 2) {
            this.setData({
                selectIndex: state,
                starText: '差',
                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png'
            })
        } else if (state == 3) {
            this.setData({
                selectIndex: state,
                starText: '一般',
                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png',
                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png'
            })
        } else if (state == 4) {
            this.setData({
                selectIndex: state,
                starText: '好',
                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star2.png'
            })
        } else if (state == 5) {
            this.setData({
                selectIndex: state,
                starText: '很好',
                star1: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star2: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star3: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star4: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png',
                star5: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/pig-star1.png'
            })
        }

    },
    imagesPreview: function (e) {
        var imgPath = (e.currentTarget.dataset.images);
        wx.previewImage({
            current: '', // 当前显示图片的http链接
            urls: imgPath // 需要预览的图片http链接列表
        })
    },
    upload: function () {
        var that = this;
        wx.chooseImage({
            count: 8, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                var tempFilePaths = that.data.imgPath.concat(res.tempFilePaths);
                that.setData({
                    imgPath: tempFilePaths
                })
            }
        })
    },
    removeImages: function (e) {
        var that = this;
        var state = Number(e.target.dataset.index);
        that.data.imgPath.splice(state, state);
        if (state == 0) {
            that.data.imgPath = [];
        }
        that.setData({
            imgPath: that.data.imgPath
        })
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

    },
    arr: [],
    //多张图片上传
    uploadimg: function (data, _this) {
        var that = this,
            i = data.i ? data.i : 0,
            success = data.success ? data.success : 0,
            fail = data.fail ? data.fail : 0;
        if (that.data.imgPath.length == 0) {
            that.callback();
            return;
        }
        wx.uploadFile({
            url: data.url,
            filePath: data.path[i],
            name: 'fileData',
            header: {
                "Xcx-Appid": wx.getExtConfigSync().wx_appid,
                "Xcx-Membertoken": wx.getStorageSync('memberToken')
            },
            formData: null,
            success: (resp) => {
                success++;

                if (resp.statusCode == 200) {
                    var json = JSON.parse(resp.data);
                    if (json.Code == 0) {
                        that.arr.push(json.Data.ImagePath);
                    }

                }
                //这里可能有BUG，失败也会执行这里
            },
            fail: (res) => {
                fail++;
            },
            complete: () => {
                i++;
                if (i == data.path.length) {   //当图片传完时，停止调用   
                    that.callback();
                } else {//若图片还没有传完，则继续调用函数
                    data.i = i;
                    data.success = success;
                    data.fail = fail;
                    that.uploadimg(data);
                }

            }
        });
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})
function filteremoji(a) {
  var ranges = [
    '\ud83c[\udf00-\udfff]',
    '\ud83d[\udc00-\ude4f]',
    '\ud83d[\ude80-\udeff]'
  ];
  var emojireg = a;
  return emojireg = emojireg.replace(new RegExp(ranges.join('|'), 'g'), '');
}