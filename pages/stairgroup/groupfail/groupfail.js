// pages/stairgroup/auctionfail/auctionfail.js
Page({
    data: {
        copyright: {}
    },
    onLoad: function (options) {
        const { pageStatus, orderId } = options;
        let [imgSrc, toastText] = ['', '']
        if (pageStatus == 0) {
            imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-15.png';
            toastText = '亲，超出商家设定的限购数量啦~';
        } else if (pageStatus == 1) {
            imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-11.png';
            toastText = '您来晚了一步，商品已售罄，当前活动已结束~';
        } else if (pageStatus == 2) {
            imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-10.png';
            toastText = '支付超时啦！订单已关闭~';
        } else if (pageStatus == 3) {
            imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-11.png';
            toastText = '您晚了一步，由于库存不足，货款已原路返回~';
        } else if (pageStatus == 4) {
            imgSrc = 'http://file.xiaokeduo.com/system/xkdxcx/system/images/empty-data-11.png';
            toastText = '您晚了一步，当前活动已结束~';
        }
        this.setData({
            orderId,
            pageStatus,
            emptyData: { imgSrc, toastText }
        })
    },
    onShow:function (){
        app.buttomCopyrightSetData(this, 'fixed', 'close');
    },
    sendFormId: function (e) {
        app.sendFormId(e.detail.formId, 0);
    }

})