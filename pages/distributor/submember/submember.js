// pages/submember/submember.js
//店铺会员、分销商
const app = getApp();
const util = require("../../../utils/util");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadComplete: false,
        pageIndex: 1,
        pageSize: 10,
        membersList: [],
        fristDistributorsList: [],
        secondDistributorList: [],
        navCount: {
            FirstDistributorCount: 0,
            SecondDistributorCount: 0,
            MemberCount: 0
        },
        config: {
            FenxiaoLevel: 1,
            FirstDistributorName: '本店会员',
            SecondDistributorName: '下一级分店',
            ThirdDistributorName: '下二级分店'
        },
        pullLoading: false,
        loadingText: '上拉显示更多',
        isShowLoading: false,
        isShowToast: false,
        toastText: {},
        scrollTop: 0,
        navId: '1',
        memberEmptyData: {
            imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-1.png',
            toastText: '暂无会员~'
        },
        distributorEmptyData: {
            imgSrc: 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-3.png',
            toastText: '暂无分店~'
        },
        copyright: {}
    },
    isPullLoading: false,
    getMyMembers(pull, initial) {
        const that = this;
        app.request({
            url: "/Distributor/GetMyMembers",
            data: {
                pageIndex: that.data.pageIndex,
                pageSize: that.data.pageSize,
                requestDomain: 'fxs_domain'
            },
            success(res) {
                if (res.Code === 0) {
                    let list = res.Data.Data;
                    //循环处理数据
                    //
                    if (pull) {
                        that.setData({
                            membersList: that.data.membersList.concat(list)
                        });
                    } else {
                        that.setData({
                            membersList: list
                        })
                    }
                    if (res.Data.Total <= that.data.membersList.length) {
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
                    that.data.copyright.position = that.data.membersList.length > 2 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                } else {
                    util.showToast({
                        text: '接口错误' + res.Msg,
                        duration: 2000
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
    getFristDistributors(pull, initial) {
        const that = this;
        app.request({
            url: "/Distributor/GetFristDistributors",
            data: {
                pageIndex: that.data.pageIndex,
                pageSize: that.data.pageSize,
                requestDomain: 'fxs_domain'
            },
            success(res) {
                if (res.Code === 0) {
                    let list = res.Data.PageModel.Data;
                    //循环处理数据
                    //
                    list.forEach(function (item, index) {
                        item.LastOrderDateStr = util.formatDateTime(item.LastOrderDate);
                    });
                    if (pull) {
                        that.setData({
                            fristDistributorsList: that.data.fristDistributorsList.concat(list)
                        });
                    } else {
                        that.setData({
                            fristDistributorsList: list
                        })
                    }
                    if (res.Data.PageModel.Total <= that.data.fristDistributorsList.length) {
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
                    that.data.copyright.position = that.data.fristDistributorsList.length > 2 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                } else {
                    util.showToast({
                        text: '接口错误' + res.Msg,
                        duration: 2000
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
    getSecondDistributors(pull, initial) {
        const that = this;
        app.request({
            url: "/Distributor/GetSecondDistributors",
            data: {
                pageIndex: that.data.pageIndex,
                pageSize: that.data.pageSize,
                requestDomain: 'fxs_domain'
            },
            success(res) {
                if (res.Code === 0) {
                  let list = res.Data.PageModel.Data;
                    //循环处理数据
                    //
                    list.forEach(function (item, index) {
                        item.LastOrderDateStr = util.formatDateTime(item.LastOrderDate);
                    });
                    if (pull) {
                        that.setData({
                            secondDistributorList: that.data.secondDistributorList.concat(list)
                        });
                    } else {
                        that.setData({
                            secondDistributorList: list
                        })
                    }
                    if (res.Data.Total <= that.data.secondDistributorList.length) {
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
                    that.data.copyright.position = that.data.secondDistributorList.length > 2 ? '' : 'copyright-fixed';
                    that.setData({
                        loadComplete: true,
                        copyright: that.data.copyright
                    })
                    that.isPullLoading = false;
                } else {
                    util.showToast({
                        text: '接口错误' + res.Msg,
                        duration: 2000
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
        const navId = e.currentTarget.dataset.id;
        if (navId == this.data.navId) return;
        this.setPageTitle(navId);
        this.setData({
            //loadComplete: false,
            pageIndex: 1,
            pageSize: 10,
            scrollTop: 0,
            membersList: [],
            fristDistributorsList: [],
            secondDistributorList: [],
            loadComplete: false,
            isShowLoading: false,
            loadingText: '',
            navId: navId
        })
        this.data.pullLoading = true;
        if (navId === '1') {
            this.getMyMembers();
        }
        if (navId === '2') {
            this.getFristDistributors();
        }
        if (navId === '3') {
            this.getSecondDistributors();
        }
    },
    setPageTitle(navId) {
        if (navId == '1') {
            wx.setNavigationBarTitle({
                title: '下属会员'
            });
        } else if (navId == '2') {
            wx.setNavigationBarTitle({
                title: '下级分店'
            });
        } else if (navId == '3') {
            wx.setNavigationBarTitle({
                title: '下级分店'
            });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //判断店铺层级，给定分销店铺名，获取统计数量
        const that = this;
        let navId = options.navId ? options.navId : '1';
        that.setPageTitle(navId);
        that.setData({ navId: navId });
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
        const that = this;
        app.request({
            url: '/Distributor/GetDistributorShopInfo',
            data: {
                requestDomain: 'fxs_domain'
            },
            success: (res) => {
                if (res.Code == 0) {
                    that.setData({
                        config: res.Data
                    });
                }
            }
        });
        //接口写完后这个放出来
        app.request({
            url: '/Distributor/GetStoreMemberNumber',
            data: {},
            success: (res) => {
                if (res.Code == 0) {
                    that.setData({
                        navCount: res.Data
                    });
                }
            }
        });
        if (that.data.navId == '1') {
            that.getMyMembers();
        } else {
            that.getFristDistributors();
        }
    },
    pullLoadingMembersData() {
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            //this.data.pullLoading=false;
            that.isPullLoading = true;
            that.data.pageIndex++;
            that.setData({
                pageIndex: that.data.pageIndex,
                loadingText: '正在加载更多数据~'
            });
            setTimeout(function () {
                that.getMyMembers('pull');
            }, 1000)
        }
    },
    pullLoadingFirstData() {
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            //this.data.pullLoading=false;
            that.isPullLoading = true;
            that.data.pageIndex++;
            that.setData({
                pageIndex: that.data.pageIndex,
                loadingText: '正在加载更多数据~'
            });
            setTimeout(function () {
                that.getFristDistributors('pull');
            }, 1000)
        }
    },
    pullLoadingSecondData() {
        var that = this;
        if (that.data.pullLoading && !that.isPullLoading) {//是否还有数据
            //this.data.pullLoading=false;
            that.isPullLoading = true;
            that.data.pageIndex++;
            that.setData({
                pageIndex: that.data.pageIndex,
                loadingText: '正在加载更多数据~'
            });
            setTimeout(function () {
                that.getSecondDistributors('pull');
            }, 1000)
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.buttomCopyrightSetData(this, false, 'close');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }
})