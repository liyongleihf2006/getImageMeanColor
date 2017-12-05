/**
 * Created by liyongleihf2006
 * @param {*} params 
 *            imageUrl:string 图片的url
 *            skewPosition:string default "top"    “top” or "bottom"
 *                         获取图片的颜色是从图片的顶部开始还是底部
 *            clipHeight:string or number 图片裁剪的高度  
 *                         当为string类型时,当isNaN时,单位可以传入
 *                                        %:表示图片实际高度的百分比
 *                                        px:表示高度为固定的像素值
 *                                        当!isNaN时跟number类型相同
 *                         当为number类型时
 *                                       当>0,<=1时,表示图片实际高度的分值
 *                                       当>1时,表示高度为固定的像素值
 *            minification:number default 10 
 *                         在计算获取颜色值时进行的缩放比率
 *                                       当为1的时候是最精确的值,但计算速度不会提升
 *                                       该值越大计算速度越快,但过大时会导致精度下降
 *            cb:function(color,r,g,b,a,l)       获取值的回调函数
 *                        color:计算出的rgba值字符串
 *                        r:红色通道的值
 *                        g:绿色通道的值
 *                        b:蓝色通道的值
 *                        a:颜色透明度
 *                        l:亮度    
 */
function getImageMeanColor(params){
    /* 图片的url */
    var imageUrl = params.imageUrl;
    /* 抓取的图片源的裁剪开始上下位置,default:top
     * top or bottom
    */
    var skewPosition = params.skewPosition||"top";
    /* 抓取的图片源的裁剪高度 */
    var clipHeight = params.clipHeight||"100%";
    /* 缩小倍数 */
    var minification = params.minification||10;
    /* 回调函数返回图像颜色平均值*/
    cb = params.cb;
    if(!imageUrl){
        throw new Error("the imageUrl is required!");
    }
    if(typeof clipHeight!=="string"&&typeof clipHeight!=="number"){
        throw new Error("the clipHeight must be a string or number");
    }
    var canvasHeight,imageHeight,top=0;
    var image = new Image();
    image.src= imageUrl;
    image.onload=function(){
        getMeanColor();
    }
    /* 获取颜色平均值 */
    function getMeanColor(){
        var canvas=document.createElement("canvas");
        var width = image.width;
        imageHeight = image.height;
        confirmHeight();
        if(skewPosition==="bottom"){
            top = canvasHeight - imageHeight;
        }

        /* 根据minification对图像进行缩小处理,主要是为了提高运算速度 */
        width/=minification;
        canvasHeight/=minification;
        imageHeight/=minification;
        top/=minification;

        canvas.height=canvasHeight;
        canvas.width=width;
        var content = canvas.getContext("2d");
        content.drawImage(image,0,top,width,imageHeight);
        var imgData=content.getImageData(0,0,width,canvasHeight);
        var data = imgData.data;
        var redChannel=0;
        var greenChannel=0;
        var blueChannel=0;
        var alphaChannel=0;
        var count=0;
        for(var i=0;i<data.length;i+=4){
            if(data[i+3]!=0){
                redChannel+=data[i];
                greenChannel+=data[i+1];
                blueChannel+=data[i+2];
                alphaChannel+=data[i+3];
                count++;
            }
        }
        var redMean = redChannel/count;
        var greenMean = greenChannel/count;
        var blueMean = blueChannel/count;
        var alphaMean = alphaChannel/count/255;
        var color = "rgba("+Math.round(redMean)+","+Math.round(greenMean)+","+Math.round(blueMean)+","+alphaMean+")";
        /* 亮度 */
        var l = (Math.max(redMean,greenMean,blueMean)+Math.min(redMean,greenMean,blueMean))/2/255;
        cb(color,redMean,greenMean,blueMean,alphaMean,l);
    }
    /* 计算高度 */
    function confirmHeight(){
        if(typeof clipHeight === "string"){
            clipHeight = clipHeight.trim();
            if(isNaN(clipHeight)){
                if(/%$/.test(clipHeight)){
                    canvasHeight =imageHeight*clipHeight.replace(/%$/,"")/100;
                }else if(/px$/.test(clipHeight)){
                    canvasHeight = clipHeight.replace(/px$/,"");
                }
            }else{
                _confirmHeight();
            }
        }else{
            _confirmHeight();
        }
        function _confirmHeight(){
            clipHeight = +clipHeight;
            if(clipHeight<0){
                if(clipHeight<0){
                    throw new Error("the clipHeight must greater than equal to or equal to zero");
                }
            }
            if(clipHeight<=1){
                canvasHeight=imageHeight*clipHeight;
            }else{
                canvasHeight=clipHeight;
            }
        }
        
    }
}