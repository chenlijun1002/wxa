function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
     * offetHeight  滚动计算部分到顶部距离
     * scrollTop   滚动高度
     * height      每个模块的高度
     * colunm      列数
    **/
function countIndex(offetHight, scrollTop, height, colunm) {
  // 单例获取屏幕宽度比
  if (!countIndex.pix) {
    try {
      let res = wx.getSystemInfoSync()
      countIndex.pix = res.windowWidth / 375
    } catch (e) {
      countIndex.pix = 1
    }
  }
  let scroll = scrollTop - offetHight * countIndex.pix
  let hei = height * countIndex.pix
  return scroll > 0 ? Math.floor(scroll / hei) * colunm : 0
}

/**接口回调后都会执行的方法，用于判断是否显示页面内容  edit by syc
 * currentPage  当前页面的page对象
 * interfaceCount 当前页面的接口成功数
 * totalInterfaceCount  当前页面的接口总数
 */
function contentShow(currentPage, interfaceCount, totalInterfaceCount) {
  if (interfaceCount == totalInterfaceCount) {
    currentPage.setData({
      loadComplete: true
    });
  }
}

function showToast(that, obj) {
  if (!that.data.isShowToast) {
    that.setData({
      isShowToast: true,
      toastText: obj
    });
    setTimeout(function () {
      that.setData({
        isShowToast: false
      });
      if (obj.callBack && typeof obj.callBack == 'function') obj.callBack();
    }, obj.duration)
  }
}

/**
 * 得到订单状态的中文描述
 */
function getOrderStatusName(orderStatus) {
  var str = "-";
  switch (orderStatus) {
    case 1:
      str = "待付款";
      break;
    case 2:
      str = "待发货";
      break;
    case 3:
      str = "已发货";
      break;
    case 4:
      str = "已关闭";
      break;
    case 5:
      str = "交易成功";
      break;
    case 6:
      str = "申请退款";
      break;
    case 7:
      str = "申请退货";
      break;
    case 8:
      str = "申请换货";
      break;
    case 9:
      str = "已退款";
      break;
    case 10:
      str = "已退货";
      break;
    case 12:
      str = "已删除";
      break;
    case 13:
      str = "拒绝退款";
      break;
    case 14:
      str = "待自提";
      break;
  }
  return str;
}
function timeDifference(endDate, day, isTimeStamp, now) {
  if (!isTimeStamp) {
    endDate = endDate.replace('T', ' ').replace(/\-/g, '/');
  }
  var timeStamp = isTimeStamp ? endDate - now : new Date(endDate).getTime() - new Date().getTime();
  var dateArr = [];
  var dateDay = 0;
  if (day) {
    dateDay = Math.floor(timeStamp / 1000 / 60 / 60 / 24);
    dateArr = [Math.floor(timeStamp % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)), Math.floor(timeStamp % (1000 * 60 * 60 * 24) % (1000 * 60 * 60) / (1000 * 60)), Math.floor(timeStamp % (1000 * 60 * 60 * 24) % (1000 * 60 * 60) % (1000 * 60) / 1000)];
  } else {
    dateArr = [Math.floor(timeStamp / 1000 / 60 / 60), Math.floor(timeStamp / 1000 / 60 % 60), Math.floor(timeStamp / 1000 % 60)];
  }
  dateArr.forEach(function (item, index) {
    if (item < 10 && item >= 0) {
      dateArr[index] = '0' + item;
    } else if (item < 0) {
      dateArr[index] = '00';
    }
  });
  if (day) {
    if (dateDay > 0) {
      if (dateDay < 10) dateDay = '0' + dateDay;
      return dateDay + '天 ' + dateArr.join(':');
    } else {
      return dateArr.join(':');
    }
  } else {
    return dateArr.join(':');
  }
}
function formatDateTime(timeStr) {
  if (timeStr != null) {
    var date = new Date(parseInt(timeStr.replace("/Date(", "").replace(")/", ""), 10));
    //月份为0-11，所以+1，月份小于10时补个0
    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    var hour = date.getHours();
    if (hour < 10) hour = '0' + hour;
    var minute = date.getMinutes();
    if (minute < 10) minute = '0' + minute;
    var second = date.getSeconds();
    if (second < 10) second = '0' + second;
    var dd = date.getFullYear() + "-" + month + "-" + currentDate + " " + hour + ":" + minute + ":" + second;
    return dd;
  }
  return "";
}

/**
 * 过滤emoji表情
 */
function emojiFilter(str) {
  var regStr = /[^\u4e00-\u9fa5|\u0000-\u00ff|\u3002|\uFF1F|\uFF01|\uff0c|\u3001|\uff1b|\uff1a|\u3008-\u300f|\u2018|\u2019|\u201c|\u201d|\uff08|\uff09|\u2014|\u2026|\u2013|\uff0e]/g;
  if (str == null || str == '') {
    return '';
  }
  if (regStr.test(str)) {
    str.replace(regStr, '');
  }
  return str;
}
//组件通信
class Event {
  constructor() {
    this.stores = {};
  }
  on(event, fn, ctx) {
    if (typeof fn != 'function') {
      console.error('fn必须为函数');
      return;
    }
    if (!this.stores[event]) {
      this.stores[event] = [];
    }
    this.stores[event].push({
      fn,
      ctx
    });
  }
  emit(event, agrs) {
    if (!this.stores[event]) {
      console.error('没有该类型事件');
      return;
    }
    const events = this.stores[event];
    for (let e of events) {
      e.fn.apply(e.ctx, agrs);
    }
  }
  off(event, fn) {
    //不传参数即为移除全部
    if (!arguments.length) {
      this.stores = {};
      return;
    }
    //无该类型 
    if (!this.stores[event]) {
      return;
    }
    //remove all handles 
    if (arguments.length === 1) {
      delete this.stores[event]
      return
    }
    //remove specific event
    var events = this.stores[event];
    this.stores[event] = events.filter(item => {
      item.fn != fn
    })
  }
}
function imageUtil(e) {
  var imageSize = {};
  var originalWidth = e.detail.width;//图片原始宽  
  var originalHeight = e.detail.height;//图片原始高  
  var originalScale = originalHeight / originalWidth;//图片高宽比  
  console.log('originalWidth: ' + originalWidth)
  console.log('originalHeight: ' + originalHeight)
  //获取屏幕宽高  
  wx.getSystemInfo({
    success: function (res) {
      var windowWidth = res.windowWidth;
      var windowHeight = res.windowHeight;
      var windowscale = windowHeight / windowWidth;//屏幕高宽比  
      console.log('windowWidth: ' + windowWidth)
      console.log('windowHeight: ' + windowHeight)
      if (originalScale < windowscale) {//图片高宽比小于屏幕高宽比  
        //图片缩放后的宽为屏幕宽  
        imageSize.imageWidth = windowWidth;
        imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
      } else {//图片高宽比大于屏幕高宽比  
        //图片缩放后的高为屏幕高  
        imageSize.imageHeight = windowHeight;
        imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
      }

    }
  })
  console.log('缩放后的宽: ' + imageSize.imageWidth)
  console.log('缩放后的高: ' + imageSize.imageHeight)
  return imageSize;
}
function filteremoji(a) {
  var ranges = [
    '\ud83c[\udf00-\udfff]',
    '\ud83d[\udc00-\ude4f]',
    '\ud83d[\ude80-\udeff]'
  ];
  var emojireg = a;
  return emojireg = emojireg.replace(new RegExp(ranges.join('|'), 'g'), '');
}
function removeSpace(str) {
  if (str){
    return str = str.replace(/&nbsp;/ig, "");
  }else{
    return '';
  }
}
module.exports = {
  emojiFilter: emojiFilter,
  filteremoji: filteremoji,
  formatTime: formatTime,
  formatDateTime: formatDateTime,
  countIndex: countIndex,
  contentShow: contentShow,
  showToast: showToast,

  getOrderStatusName: getOrderStatusName,

  removeSpace: removeSpace,
  timeDifference: timeDifference,
  Event,
  imageUtil: imageUtil
}