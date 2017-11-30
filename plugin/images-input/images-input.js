$.fn.fileInput = function(options) {
    //执行
    main(this,options);

    //主调度方法
    function main(_this,options){
        //调度
        if(options["action"]=="init") {
        }
        else {
            init(_this);
        }
    }

    //选择图片触发
    function change(e){
        //获取图片的Base64后，
        getBase64(e,function(data){
            //获取插件
            var plugin = $(e.target).closest("*[plugin='images-input']");

            //显示正在上传
            loading_show(plugin)

            //上传二进制
            $.ajax({
                type: 'post',                                   //提交的方式
                url:"http://localhost/yii-test/extend/uploadBase64.php",
                data:{
                    img:data
                },
                dataType: "JSON",
                success:function(result){
                    if(result.state.return_code == 0){
                        var path = result.data;
                        //添加图片
                        add(plugin,path);
                    }
                    else{
                        alert("上传失败");
                    }
                    //隐藏正在上传
                    loading_hide(plugin);
                },
                error:function(){
                    //DEBUG
                    alert("上传失败");
                    //隐藏正在上传
                    loading_hide(plugin);
                }
            })
        });
    }

    //根据input生成Base64码
    function getBase64(e,recall) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file); // 读出 base64
        reader.onloadend = function () {
            // 图片的 base64 格式, 可以直接当成 img 的 src 属性值
            var dataURL = reader.result;
            // 获取后返回
            if(typeof(recall) == "function")
                recall(dataURL);
        };
    }

    //初始化方法
    function init(_this){
        //获取属性
        var name = $(_this).attr("name") || "";

        //添加插件
        var plugin = document.createElement('div');
        plugin.setAttribute("plugin", "images-input");
        $(_this).append(plugin);

        //添加显示列表
        var elements = document.createElement('div');
        elements.setAttribute("class", "images-input-elements");
        $(plugin).append(elements);

        //添加值相关
        $(plugin).append('<input class="images-input-value" type="hidden" name="'+name+'"/>');

        //添加上传按钮
        var div = document.createElement('div');
        div.setAttribute("class", "images-input-button");
        var span = document.createElement('span');
        span.innerHTML = "上传图片";
        var input = document.createElement('input');
        input.setAttribute("type", "file");
        $(input).on("change",change);
        div.appendChild(span);
        div.appendChild(input);
        $(plugin).append(div);

        //添加加载层
        var loading = document.createElement('div');
        loading.setAttribute("class", "images-input-loading");
        $(loading).append('<div class="images-input-shade"></div><div class="images-input-icon"></div>');
        $(elements).append(loading);
    }

    //添加图片
    function add(plugin,path){
        //添加元素
        var element = document.createElement('div');
        element.setAttribute("class", "images-input-element");
        $(plugin).find(".images-input-elements").append(element);

        //设置元素内容
        var html = "<div class='images-input-shade'>" +
            "<div class='backdrop'></div>" +
            "<div class='action'><span>移除</span></div>" +
            "</div>" +
            "<img src='"+path+"'>";
        $(element).append(html);

        //添加移除按钮
        $(element).find(".action span").on("click",function(){remove(plugin,path)});

        //获取旧值
        var input = $(plugin).find(".images-input-value");
        var value_json = input.val();
        var value = null;
        try{
            value = JSON.parse(value_json);
        }
        catch(e){
            value = [];
        }

        //设置新值
        value.push(path);
        input.val(JSON.stringify(value));
    }

    //移除图片
    function remove(plugin,path){
        //移除相关结点
        $(plugin).find(".images-input-elements .images-input-element img[src='"+path+"']").each(function () {
            $(this).closest(".images-input-element").remove();
        });

        //获取input取值
        var values = null;
        var input = $(plugin).find(".images-input-value");
        try{ values = JSON.parse(input.val()); } catch (e){ values = [] }

        //移除值并JSON化回input
        var index = values.indexOf(path);
        if (index > -1) values.splice(index, 1);
        input.val(JSON.stringify(values));
    }

    //显示加载中
    function loading_show(plugin){
        var loading = $(plugin).find(".images-input-loading");
        var btn = $(plugin).find(".images-input-button");

        $(loading).css("visibility","visible");                //显示加载中框
        $(btn).attr("disabled","disabled");                    //设置按钮不可点击
        $(btn).css('pointer-events', "none");                  //设置按钮内部元素点击无效
    }

    //隐藏加载中
    function loading_hide(plugin){
        var loading = $(plugin).find(".images-input-loading");
        var btn = $(plugin).find(".images-input-button");

        $(loading).css("visibility","hidden");                //隐藏加载中框
        $(btn).removeAttr("disabled");                        //设置按钮可点击
        $(btn).css('pointer-events', "auto");                 //设置按钮内部元素点击有效
    }
}