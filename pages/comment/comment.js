// comment.js
var app = getApp();
Page({
    data: {
        selectIndex: -1,
        pullLoading: false,
        commentList: [],
        loadingText: '上拉显示更多',
        isShowLoading: false,
        loadComplete: false,
        isShowToast: false,
        total: 0,
        copyright: {}
    },
    onLoad: function (options) {
        var that = this;
        this.setData({
            productId: options.productId
        })
        if (wx.getStorageSync('isLogin')) {
            that.requestData(-1);
        } else {
            app.getUserInfo(() => {
                this.setData({
                    showAuthorization: true
                })
            }, () => {
                that.requestData(-1);
            })
        }
    },
    getuserinfo: function () {
        this.requestData(-1);
        this.setData({
            showAuthorization: false
        })
    },
    onShow:function (){
        app.buttomCopyrightSetData(this, false, 'close');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    changeState: function (e) {
        var that = this;
        var state = Number(e.target.dataset.index);
        if (that.parameter.status == state) return false;  //如果是点击的是当前的直接不处理
        this.setData({
            selectIndex: state,
            loadComplete: false,
            isShowLoading: false,
            scrollTop: 0,
        })
        that.parameter.pageIndex = 1;//重置到第一页
        that.requestData(state);//重新加载数据
    },
    pullLoadingData: function () {
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            that.isPullLoading = true;
            that.parameter.pageIndex++;
            that.setData({
                loadingText: '正在加载更多数据~'
            });
            setTimeout(function () {
                that.requestData(that.parameter.status, 'pull');
            }, 1000)
        }
    },
    showAllText:function(e){
      var index=e.currentTarget.dataset.index;
      var commentList = this.data.commentList;
      if (commentList[index].showAll){
        commentList[index].showAll = false;
      }else{
        commentList[index].showAll = true;
      }      
      this.setData({
        commentList: commentList
      })
    },
    requestData: function (status, pull) {
        var that = this;
        that.parameter.status = status;
        that.parameter.productId = this.data.productId;
        app.request({
            data: that.parameter,
            url: '/Detail/GetAllCommentLists',
            success: function (res) {
                if (res.Code == 0) {
                    var jsonData = JSON.parse(res.Data);
                    that.setData({
                        totalcount: jsonData.totalcount,
                        hasimgcount: jsonData.hasimgcount
                    });                    

                    var commentList = jsonData.data;
                    commentList.forEach(function (item) {
                      item.showAll = false;
                    })
                    if (pull) {
                        that.data.commentList = that.data.commentList.concat(commentList);
                        that.setData({
                            commentList: that.data.commentList
                        })
                    } else {
                        that.setData({
                            commentList: commentList
                        })
                    }
                    if (jsonData.total <= that.data.commentList.length) {
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
                    that.data.copyright.position = that.data.commentList.length > 4 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                }
            }
        })
    },
    imagesPreview: function (e) {
        var imgPath = (e.currentTarget.dataset.images);
        var currentImg = e.target.dataset.target;
        wx.previewImage({
            current: currentImg, // 当前显示图片的http链接
            urls: imgPath // 需要预览的图片http链接列表
        })
    },
    parameter: {
        status: -1,
        pageIndex: 1,
        pageSize: 5
    },
    isPullLoading: false
})