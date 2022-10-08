let fs = require("fs");
const data = fs.readFileSync("./js_markdown.md", "utf-8");
htmlRes(data);
var htmlArr =[]
var htmlData = [] //html元素数组
//判断是不是####
function htmlRes(data) {
  if(htmlArr === undefined)htmlArr = []
  htmlArr = data.split("\n");
  htmlArr.forEach((item,index)=>{
    item = item.trim()
    //标题
    if(item !== '\n' && item.length >1){
        let titleRes = retrunTitle(item)
        if(titleRes){
          htmlData.push(titleRes)    
        }   
    }
    // //超链接 字符必须超过6个
    if(item.length > 6){
        ifLink(item)
    }
    //引用语法
    if(item.length>2 && item[0] == '>'){
        htmlData.push(returnQuote(item,index))
    }
  })
}

//返回标题
function retrunTitle(item){
    // 1-7 #
    for (let i = 7; i >= 1; i--) {
      if (item.indexOf(returnFor(i)) !== -1 && item[0] === '#') {
        if(htmlData === undefined)htmlData = []
        //这里就是 查询的字符的索引然后加上这个标题#的个数就是内容
        return createElement(item.indexOf(returnFor(i)) + i, item)
      }
    }
  return false
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
  content = content.trim()
  // []()
  let arr = ["[", "]", "(", ")"];
  let arr2 = []
  let flag = 0;
  //循环查询
  arr.forEach(item=>{
    if(content.indexOf(item) !==-1){
      arr2.push(content.indexOf(item))
      flag++
    }
  })
  //四个都有
  if(flag === 4){
      if(arr2[0] < arr2[1] && arr2[1]+1 === arr2[2] && arr2[3] == content.length-1){
         //这个时候就是超链接 -----提取内容[a标签内容] (链接)
         let aText = content.slice(arr2[0]+1,arr2[1])
         let link = content.slice(arr2[2]+1,arr2[3])
         if(htmlData === undefined)htmlData = []
         htmlData.push(`<a href="${link}" alt="图片">${aText}</a>`)
      }
  }else{
    return
  }
}

//------------------------------引用语法------------------------------------
function returnQuote(content,index = null){
  content = content.trim()
  console.log(content,index,htmlArr,'全部数据')
  let flag = true
  let i = index +1
  let successCount = 0
  while(flag){
     if(htmlArr[i]){
        let str = htmlArr[i]
        if( str[0] === '>'){
          //连续的引用数量
          successCount++
          console.log('+l',successCount)
          i++
        }else{
          flag = false
        }         
     }
     flag = false
  }
  console.log(successCount,'数量')
  if(successCount){
    //有连续的时候
      for(let i =0;i<=successCount;i++){
        if(returnTitle(htmlArr[index+i])){
          
        }
      }
      htmlArr.splice(index+1,successCount)
      console.log(htmlArr)
  }else{
    //没有连续的时候
  }
  // if(content[1] === ' '){//长度必须大于2
  //   // console.log(content,'content')
  //   let titleRes = retrunTitle(content.slice(2))
  //   if(titleRes){//引用标题
  //       return `<div class="quote">${titleRes}</div>`
  //   }
  //   //单纯引用
  //   return `<div class="quote">${content.slice(2)}</div>`
  // }
  return false
}

//创建标签
function createElementQ(name,classContent,content){
  let arr1 = [`<${name} class="${classContent}">`]
  let arr2 = [`</${name}>`]
  return arr1.concat(arr2)
}
