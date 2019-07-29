// pages/unauthorized/unauthorized.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            cellphone: options.shopcellphone
        })
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    },
    callShoptell: function (e) {
        var tell = e.target.dataset.tell;
        wx.makePhoneCall({
            phoneNumber: tell 
        })
    }
})