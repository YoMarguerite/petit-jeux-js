export function rect(config, width, height){
    var bool = width<height;
    var ref = bool ? width:height;
    var ratio = bool ? (height/width) : (width/height);
    return {width: (ref/100*config.width)/ratio, height:(ref/100*config.height)/ratio};
}