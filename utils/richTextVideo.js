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

function filterSource(str) {
  var reg = /<source.*?\/>/g;
  str = str.replace(reg, '');
  return str;
}

function richTextVideo(article){
  var a=filterVideo(article);
  return splitArr(a, article);
}

module.exports = {
  richTextVideo: richTextVideo,
  filterSource: filterSource
}