let str = '    fn(sdfsdfsdfs)';
let result = /[a-z]*\(*\)/.test(str.trim());
console.log(result);