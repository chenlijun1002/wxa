// pages/supportvalueapply/supportvalueapply.js
var app = getApp();
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        toastText: {},
        imgFilePath:[]
    },
    userName:'',
    tel:'',
    linkUrl:'',
    OrderItemId:'',
    submitImgArr:[],
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const that=this;
        that.OrderItemId = options.orderItemId;
        app.request({
            url:'/protection/GetProductInfo',
            data:{
                OrderItemId: options.orderItemId
            },
            success(res){
                if(res.Code==0){
                    that.setData({
                        productInfo: res.Data
                    })
                }
            }
        })
    },
    changeUserName(e){
        this.userName = e.detail.value;
    },
    changeTel(e){
        this.tel = e.detail.value;
    },
    changeLink(e){
        this.linkUrl = e.detail.value;
    },
    uploadImg(){
        const that=this;
        let count = 9 - that.data.imgFilePath.length;
        wx.chooseImage({
            count: count,
            success(res){
                var tempFilePaths = that.data.imgFilePath.concat(res.tempFilePaths);
                that.setData({
                    imgFilePath: tempFilePaths
                })
            }
        })
    },
    uploadFileImg(FilePath, index,callBack){
        const that=this;
        setTimeout(function (){
            app.request({
                url: '/protection/UploadBase64Files',
                contentType: 'multipart/form-data',
                requestType: 'upload',
                filePath: FilePath,
                fileName: '保价申请图片',
                success: function (res) {
                    let resObj = JSON.parse(res);
                    if (resObj.Code == 0) {
                        that.submitImgArr[index] = resObj.Data.ImagePath;
                    }
                },
                complete() {
                    if (callBack) callBack();
                }
            })
        },100)
    },
    uploadFileTransfer(imgFilePaths,TransferCallBack){
        let counter=0;
        const that=this;
        if (imgFilePaths.length>0){
            imgFilePaths.forEach(function (item,index) {
                ;(function (idx){
                    that.uploadFileImg(item, idx, function () {
                        counter++;
                        if (counter >= imgFilePaths.length) {
                            if (TransferCallBack) TransferCallBack();
                        }
                    });
                })(index)
            })
        }else{
            if (TransferCallBack) TransferCallBack();
        }
    },
    deleteImg(e){
        let index = e.currentTarget.dataset.index;
        this.data.imgFilePath.splice(index, 1);
        this.setData({
            imgFilePath: this.data.imgFilePath 
        })
    },
    setPageState() {
        const that = this;
        if (!this.userName || !/(^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,10}$)|(^[a-zA-Z]{2,20}$)/.test(this.userName)){
            util.showToast(this, {
                text: '请填写您的真实姓名',
                duration: 2000
            });
            return false;
        }
        if (!/^1[2-9][0-9]{9}$/.test(this.tel)) {
            util.showToast(this, {
                text: '请填写您正确的手机号',
                duration: 2000
            });
            return false;
        }
        if (this.linkUrl){
            let reg = /^((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g;
            if (!reg.test(this.linkUrl)){
                util.showToast(this, {
                    text: '请填写正确的商品连接！',
                    duration: 2000
                });
                return false;
            }
        }
        wx.showLoading({
            title: '申请中····',
        })
        that.uploadFileTransfer(that.data.imgFilePath,function (){
            app.request({
                url:'/protection/applyProductProtectPrice',
                data:{
                    OrderItemId: that.OrderItemId,
                    ProductLink: that.linkUrl,
                    Screenshot: that.submitImgArr,
                    userName: that.userName,
                    userTel:that.tel
                },
                success(res){
                    if(res.Code==0){
                        if (res.Data==0){
                            wx.showToast({
                                title: '申请成功！',
                            })
                            that.setData({
                                showPageState: true
                            })
                        }else{
                            util.showToast(that, {
                                text: res.Msg,
                                duration: 2000
                            });
                        }
                    }
                },
                complete(){
                    wx.hideLoading()
                }
            })
        })
    },
    btnClick() {
        app.navigateTo('/pages/supportvalueservice/supportvalueservice?applyState=1', 'redirectTo');
    }
})