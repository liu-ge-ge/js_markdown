let fs = require("fs");
const data = fs.readFileSync("./js_markdown.md", "utf-8");
htmlRes(data);
var htmlArr = [];
var htmlData = []; //html元素数组
var titleArr = [];//列表数组


//判断是不是####
function htmlRes(data) {
  if (htmlArr === undefined) htmlArr = [];
  htmlArr = data.split("\n");
  htmlArr.forEach((item, index) => {
    item = item.trim();
    //标题
    if (item !== "\n" && item.length > 1) {
      let titleRes = retrunTitle(item);
      if (titleRes) {
        htmlData.push(titleRes);
      }
    }
    // //超链接 字符必须超过6个
    if (item.length > 6) {
      ifLink(item);
    }
    //引用语法
    if (item.length > 2 && item[0] == ">") {
      htmlData.push(returnQuote(item, index));
    }
    //图片
    if (item.length > 5 && item[0] == "!") {
      returnImg(item);
    }
    //判断有序列表
    if (returnIsOl(item)) {
      let arr = htmlArr[index].split('')
      let num = 0
      let flag = true
      let i = 0
      while(flag){
        if(arr[i] === ' '){
          num = num+1
        }else{
          flag = false
        }
        i=i+1
      }
      console.log(num,item,'这一行的')
      if(num % 4 === 0 && num !==0){
        let sign = num/4
        if(!titleArr)titleArr = []
        if(titleArr.length == 0 && sign>=1){
          console.log(item,'这个是要return出去的额')
          return 
        }else{
          console.log(item,'处理的数\n')
          let last = callBackFn(titleArr,sign)
          if(last.num===1){//说明有这个深度的children
              if(last.data.children){
                last.data.children.push({0:item})
              }else{
                last.data.children = [{0:item}]
              }
          }
        }
      }else{
        if(!titleArr)titleArr = []
        titleArr.push({0:item,children:[]})
      }
      // console.log(JSON.stringify(titleArr),'titleArr11111',returnIsOl(htmlArr[index+1]),htmlArr[index+1])
      if(!returnIsOl(htmlArr[index+1])){//这里判断下一行是不是li不是的话直接处理数据并清空 titleArr
         //进行处理
         console.log(JSON.stringify(titleArr),'olllll\n')
         let ol = returnOl(titleArr)
         console.log(JSON.stringify(ol),'json\n')
         titleArr = [] //制空处理
      }
    }
    // console.log(JSON.stringify(titleArr) ,'\n' ,'连续的空格数')
  });
}
function returnIsOl(item){
  console.log(item,'0123456789'.indexOf(item[0] - 0)!==-1 && item[1] === '.','itemitemitemitem')
  return '0123456789'.indexOf(item.trim()[0] - 0)!==-1
}
//判断有没有这个深度的children
function callBackFn(data,num){
  if(!data.length)return {data,num}
  if(num<1)return undefined
  if(num === 1){
    if(!data.length)return {data,num}
    return {data:data[data.length-1],num}
  }else{
    if(!data[data.length-1])return {data,num}
    return callBackFn(data[data.length-1].children,num-1)
  }
}
//返回标题
function retrunTitle(item) {
  // 1-7 #
  for (let i = 7; i >= 1; i--) {
    if (item.indexOf(returnFor(i)) !== -1 && item[0] === "#") {
      if (htmlData === undefined) htmlData = [];
      //这里就是 查询的字符的索引然后加上这个标题#的个数就是内容
      return createElement(item.indexOf(returnFor(i)) + i, item);
    }
  }
  return false;
}

//生成 1-7 个#
function returnFor(num) {
  let data = "";
  for (let i = 0; i < num; i++) {
    data += "#";
  }
  return data;
}

//创建h标签
function createElement(num, item) {
  item = item.slice(num).replace("\r", "");
  return `<h${num}>${item}</h${num}>`;
}

//判断是不是超链接--------------------------------------------------------------
function ifLink(content) {
  content = content.trim();
  // []()
  let arr = ["[", "]", "(", ")"];
  let arr2 = [];
  let flag = 0;
  //循环查询
  arr.forEach((item) => {
    if (content.indexOf(item) !== -1) {
      arr2.push(content.indexOf(item));
      flag++;
    }
  });
  //四个都有
  if (flag === 4) {
    if (
      arr2[0] < arr2[1] &&
      arr2[1] + 1 === arr2[2] &&
      arr2[3] == content.length - 1
    ) {
      //这个时候就是超链接 -----提取内容[a标签内容] (链接)
      let aText = content.slice(arr2[0] + 1, arr2[1]);
      let link = content.slice(arr2[2] + 1, arr2[3]);
      if (htmlData === undefined) htmlData = [];
      htmlData.push(`<a href="${link}" alt="图片">${aText}</a>`);
    }
  } else {
    return;
  }
}

//------------------------------引用语法------------------------------------
function returnQuote(content, index = null) {
  content = content.trim();
  let arrHtml = [content.slice(1).trim()]; //引用的数据
  let {successCount} = returnContinu(index,arrHtml,'>')
  let htmlStr = createElementQ("div", { class: "quote" }, "div");
  //处理引用
  for (let i = 0; i < arrHtml.length; i++) {
    arrHtml[i] = arrHtml[i].trim();
    if (retrunTitle(arrHtml[i])) {
      //引用+标题
      arrHtml[i] = retrunTitle(arrHtml[i]);
    } else {
      //这里没有标题
      let ele = createElementQ("p", {}, "p");
      ele.splice(1, 0, arrHtml[i]);
      arrHtml[i] = ele.join("");
    }
  }
  htmlArr.splice(index + 1, successCount);
  htmlStr.splice(1,0,arrHtml.join(''))
  htmlData = htmlData.concat(htmlStr.join(''));
  return false;
}

//----------------------------图片语法--------------------------------
function returnImg(item) {
  console.log("这是传进来的", item);
  item = item.trim();
  let rule = {
    0: "!",
    1: "[",
    2: "]",
    3: "(",
    4: ")",
  };
  let r0 = item.indexOf(rule["0"]);
  let r1 = item.indexOf(rule["1"], r0);
  let r2 = item.indexOf(rule["2"], r1);
  let r3 = item.indexOf(rule["3"], r2);
  let r4 = item.indexOf(rule["4"], r3);
  let alt = "";
  let src = "";
  let imgTitle = "";
  if (
    item[0] === rule["0"] &&
    r1 < r2 &&
    r2 < item.indexOf(r3) &&
    r3 < r4 &&
    item[item.length - 1] === rule["4"]
  ) {
    alt = item.slice(r1 + 1, r2);
    let str = item.slice(r3 + 1, r4);
    if (str.indexOf(" ") !== -1) {
      src = str.split(" ")[0];
      imgTitle = str.split(" ")[1];
    }
    htmlData.push(createElementQ("img", { alt, src, title: imgTitle }).join(''));
  }
}

//----------------------------无序列表-------------------------------------
function returnOl(content) {
    let ol = createElementQ('ol',{},'ol') 
    if(content.length){
       for(let i=0;i<content.length;i++){
        let li = createElementQ('li',{},'li')
           for(let key in content[i]){
              if(key === 'children'){
                let olC = returnOl(content[i][key])
                li.splice(li.length-1,0,olC)
              }else{
                li.splice(li.length-1,0,content[i][key])
              }
           }
           ol.splice(ol.length-1,0,li)
       }
    }
    return ol
}

//创建标签
function createElementQ(name, classObj) {
  let keys = Object.keys(classObj);
  let str = "";
  keys.forEach((item) => {
    str += `${item}='${classObj[item]}' `;
  });
  let arr1 = [`<${name} ${str}>`];
  let arr2 = [`</${name}>`];
  return arr1.concat(arr2);
}

/**
 * 
 * @param {*} index 当前位置索引
 * @returns {
 *    successCount 连续的个数
 * label 开头标签
 * }
 */
function returnContinu(index,arrHtml,label,num=2){
  let flag = true;
  let i = index + 1; //初始当前数据的下一条
  let successCount = 0; //要删除的数量
  while (flag) {
    if (htmlArr[i]) {
      let str = htmlArr[i][0];
      if (label.indexOf(str) !==-1) {
        //连续的引用数量
        arrHtml.push(htmlArr[i].slice(num));
        i = i + 1;
        successCount = successCount + 1;
      } else {
        flag = false;
        continue;
      }
    } else {
      flag = false;
    }
  }
  return {
      successCount
  }
}
//多行连续的方法例:(引用,有无序列表)
