let str = '<span style="color:red;">这是一个span标签</span>';
let result = /^<[a-z]* *style=\".*\">.*<\/[a-z]*>/.test(str);
console.log(result);