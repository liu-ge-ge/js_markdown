// const fs = require("fs");
// const data = fs.readFileSync("./js_markdown.md", "utf-8");
// console.log(data,'datra')
let keyword = [
  "let",
  "var",
  "=>",
  "+",
  "===",
  "==",
  "=",
  ":",
  "case",
  "for",
  "function",
  "switch",
  "console.log",
  "if",
  "else",
  "split",
  "&&",
  "||",
  "indexOf",
  "slice",
  "trim",
  "push",
];
// htmlRes(data);
var htmlArr = [];
var htmlData = []; //html元素数组
var titleArr = []; //列表数组
var control = true; //控制添加普通文字
//判断是不是####
export function htmlRes(data) {
  htmlData = []
  console.log('输出传进来的数据看看到底有没有问题',data)
  if (htmlArr === undefined) htmlArr = [];
  htmlArr = data.split("\n");
  console.log(htmlArr,'htmlArrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
  htmlArr.forEach((item, index) => {
    item = item.trim();
    //标题
    if (item !== "\n" && item.length > 1) {
      let titleRes = retrunTitle(item);
      if (titleRes) {
        htmlData.push(titleRes);
        control = false
        return
      }
    }
    // //超链接 字符必须超过6个
    if (item.length > 6 && item.trim()[0] !== "!") {
      ifLink(item,index);
    }
    //引用语法
    if (item.length > 2 && item[0] == ">") {
      console.log('引用语法',item)
      htmlData.push(returnQuote(item, index));
    }
    //图片
    if (item.length > 5 && item[0] == "!") {
      returnImg(item,index);
    }
    //判断有序列表
    if (returnIsOl(item)) {
      let arr = htmlArr[index].split("");
      console.log(arr,'arrrrrrrrrrrrrr')
      let num = 0;
      let flag = true;
      let i = 0;
      //检查前边的缩进数量
      while (flag) {
        console.log(arr[i],arr[i].trim() === '')
        if (arr[i].trim() == '') {
          num = num + 1;
        } else {
          flag = false;
        }
        i = i + 1;
      }
      //检查缩进
      if (num % 4 === 0 && num !== 0) {
        let sign = num / 4;
        if (!titleArr) titleArr = [];
        if (titleArr.length == 0 && sign >= 1) {
          return;
        } else {
          let last = callBackFn(titleArr, sign);
          if (last.num === 1) {
            //说明有这个深度的children
            if (last.data.children) {
              last.data.children.push({ 0: item });
            } else {
              last.data.children = [{ 0: item }];
            }
          }
        }
      } else {
        if (!titleArr) titleArr = [];
        titleArr.push({ 0: item, children: [] });
      }
      if (!returnIsOl(htmlArr[index + 1])) {
        //这里判断下一行是不是li不是的话直接处理数据并清空 titleArr
        //进行处理
        let ol = returnOl(titleArr);
        htmlData.push(ol.flat(Infinity).join(" "));
        titleArr = []; //制空处理
      }else{
        //如果下一行是就控制
        control = false
      }
      control = false
    }
    //html标签
    if (/^<[a-z]* *>.*<\/[a-z]*>/.test(item) && item.indexOf('script') === -1) {
      htmlData.push(item);
    }
    //代码块
    // console.log(item,'item3')
    if (item.slice(0, 4) === "````") {
      returnCodeBlock(item, index);
    }
    if(control === true){
      console.log('走到这里',htmlArr,control)
      htmlData.push(`<p>${item}</p>`)
    }
    control = true;//走一圈之后再变回true
    // console.log(JSON.stringify(titleArr) ,'\n' ,'连续的空格数')
  });

  return htmlData;
}
function returnIsOl(item) {
  if(item === undefined || item.indexOf('.') == -1)return false
  item = item.trim()
  let arr = item.split('.')
  console.log(item,arr[0],'arr[0]')
  return isNumber(arr[0]);
}
//判断有没有这个深度的children
function callBackFn(data, num) {
  if (!data.length) return { data, num };
  if (num < 1) return undefined;
  if (num === 1) {
    if (!data.length) return { data, num };
    return { data: data[data.length - 1], num };
  } else {
    if (!data[data.length - 1]) return { data, num };
    return callBackFn(data[data.length - 1].children, num - 1);
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
function ifLink(content,index) {
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
      htmlArr.splice(index,1)
      control = false
    }
  }
}

//------------------------------引用语法------------------------------------
function returnQuote(content, index = null) {
  content = content.trim();
  let arrHtml = [content.slice(1).trim()]; //引用的数据
  let { successCount } = returnContinu(index, arrHtml, ">");
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
  htmlStr.splice(1, 0, arrHtml.join(""));
  htmlData = htmlData.concat(htmlStr.join(""));
  control = false
}

//----------------------------图片语法--------------------------------
function returnImg(item,index) {
  // console.log(item, "item");
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
    r2 < item.indexOf(rule["3"]) &&
    r3 < r4 &&
    item[item.length - 1] === rule["4"]
  ) {
    alt = item.slice(r1 + 1, r2);
    let str = item.slice(r3 + 1, r4);
    if (str.indexOf(" ") !== -1) {
      src = str.split(" ")[0];
      imgTitle = str.split(" ")[1];
    }
    htmlData.push(`
    <div id="line">
    ${createElementQ("img", { alt, src, title: imgTitle }).join("")}
    </div>`
);
    htmlArr.splice(index,1)
    control = false
  }
}

//----------------------------无序列表-------------------------------------
function returnOl(content) {
  let ol = createElementQ("ol", {}, "ol");
  if (content.length) {
    for (let i = 0; i < content.length; i++) {
      let li = createElementQ("li", {}, "li");
      for (let key in content[i]) {
        if (key === "children") {
          let olC = returnOl(content[i][key]);
          li.splice(li.length - 1, 0, olC);
        } else {
          li.splice(li.length - 1, 0, content[i][key]);
        }
      }
      ol.splice(ol.length - 1, 0, li);
    }
  }
  return ol;
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
function returnContinu(index, arrHtml, label, num = 2) {
  let flag = true;
  let i = index + 1; //初始当前数据的下一条
  let successCount = 0; //要删除的数量
  while (flag) {
    if (htmlArr[i]) {
      let str = htmlArr[i][0];
      if (label.indexOf(str) !== -1) {
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
    successCount,
  };
}
//代码块
function returnCodeBlock(item, index) {
  let len;
  htmlArr.slice(index + 1).forEach((item2, index2) => {
    if (item2.slice(0, 4) === "````") {
      len = index2;
      console.log("结束代码块", index, len);
    }
  });
  let arr = htmlArr.slice(index + 1, index + len + 1);
  let code = createElementQ("div", { class: "code" });
  let codeChild = createElementQ("div", { class: "codeChild" });
  code.splice(code.length - 1, 0,'<div class="language">JS</div>');
  let s = blockHighLight(arr)
  s = s.replace(/classeqs/g, "class=")
  s = s.replace(/styleeqs/g,"style=")
  s = s.replace(/\&mh\&/g,':');
  codeChild.splice(codeChild.length - 1, 0, s);
  code.splice(code.length - 1, 0,codeChild.join(''));
  //到这个地方都插进去了已经
  htmlData.push(code.join(" "));
  console.log(index,'这是第几行')
  htmlArr.splice(index, len + 1);
  control = false
}

//代码块高亮处理函数
/**
 *
 * @param {Array} arr 数据
 */
function blockHighLight(arr) {
  let arr2 = [];
  arr.forEach((item, index) => {
    if (item.trim() !== "") {
      arr2.push(keywordsHighLight(symbolHighLight(fnHighLight(handleNotes(item)))));
    }
  });
  return arr2.join("");
}

//处理关键字 高亮函数 #c3655d
function keywordsHighLight(row) {
  if(row.indexOf('notes')!==-1)return row
  let num = fnBlockNum(row)
  let str = row;
  //  let arr =['let','var','=>','+','=',':',"case",'for','function','switch','console.log']
  let index = 0
  for(let i=0;i<keyword.length;i++){
    if (str.indexOf(keyword[i],index) !== -1) {
      index = i
      str = insertStr(
        str,
        str.indexOf(keyword[i]),
        `<text classeqs"keywords">${keyword[i]}</text>`,
        keyword[i].length
      );
    }else{
      index = 0
    }
  }

  return `<p  styleeqs"margin-left&mh&${num*5}px;" >${str}</p>`;
}

//处理符号高亮 #0086cd
function symbolHighLight(row) {
  if(row.indexOf('notes')!==-1)return row

  //判断是数字
  let arr = row.split("");
  //  debugger
  arr.forEach((item, index) => {
    console.log(index == row.indexOf('px')-2 || index == row.indexOf('px')-1,row)
    if (
      !isNaN(Number(item))&&
      item.trim() !== "" && 
      (row.indexOf('px') == -1 || index > row.indexOf('px'))

    ) {
      arr[index] = `<text classeqs"symbol">${item}</text>`;
    }
  });
  return `${arr.join("")}`;
}

//函数高亮
function fnHighLight(row) {
  if(row.indexOf('notes')!==-1)return row
  let num = fnBlockNum(row)
  let str = "";
  if (/[a-z]*\(*\)/.test(row.trim())) {
    let arr = row.split("(");
    if (
      keyword.indexOf(arr[0].trim()) == -1 &&
      arr[0].trim().indexOf(" ") === -1 &&
      arr[0].trim() !== ""
    ) {
      console.log([
        arr[1],
        row.indexOf("(") - arr[0].trim().length,
        `<text classeqs"fn">${arr[0].trim()}</text>`,
        0
      ])
      str = `<text classeqs"fn" styleeqs"margin-left&mh&${num*5}px;">${arr[0].trim()}</text>(` + arr[1]
    }
  }

  if (str === "") {
    return row;
  } else {
    return str;
  }
}

//方法：
//soure 原字符串
//start 位置
//newStr 要插入的字符串
//num 后边需要删除的数量
function insertStr(soure, start, newStr, num) {
  let arr = [soure.slice(0, start), newStr, soure.slice(start + num)];
  return arr.join("");
}
//缩进处理
function fnBlockNum(str){
    let arr = str.split('')
    if(!arr[0]===' ')return 0
    let num = 0
    let flag = true
    if(arr[0] === ' '){
      arr.forEach((item,index)=>{
        if(item === ' '){
          num++
        }else{
          return num
        }
      })      
    }
    return num
}

//处理注释
function handleNotes(str){
  if(str.trim().slice(0,2)=== '//'){
    return `<p><text classeqs"notes">${str}</text></p>`
  }
  return str
}

  /**
* 校验只要是数字（包含正负整数，0以及正负浮点数）就返回true
**/

function isNumber(val){

  var regPos = /^[0-9]+.?[0-9]*/; //判断是否是数字。

  if(regPos.test(val) ){
      return true;
  }else{
      return false;
  }
}


/***
 * 
 * 目前遇到一些暂时不可解决的问题
 * 1.class=用classeqs来代替最后替换
 * 2.style=用styleeqs来代替最后替换
 * 3.”：“ 用&mh&
 */
