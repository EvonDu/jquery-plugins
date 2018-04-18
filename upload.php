<?php
class Upload
{
    /**
     * 单上传文件(Base64字符串)
     * 必须存在$_POST['base64']
     */
    static public function run($path)
    {
        if (count($_POST)) {
            $img = explode('|', $_POST['base64']);
            //上传文件(遍历获取，但只取第一个)
            for ($i = 0; $i <= count($img) - 1; $i++) {
                $path = self::upload_base64($img[$i],$path);
                break;
            }
            //返回数据
            self::sentApiResult(0, "", $path);
        } else
            self::sentApiResult(0, "image could not be saved.", null);
    }

    /**
     * 上传Base64函数
     * @param $base64
     * @return null|string
     */
    static private function upload_base64($base64,$path)
    {
        //判断上传类型
        if (strpos($base64, 'data:image/jpeg;base64,') === 0) {
            $base64 = str_replace('data:image/jpeg;base64,', '', $base64);
            $ext = '.jpeg';
        }
        else if (strpos($base64, 'data:image/png;base64,') === 0) {
            $base64 = str_replace('data:image/png;base64,', '', $base64);
            $ext = '.png';
        }
        else{
            return null;
        }

        //获取图片文件内容
        $base64 = str_replace(' ', '+', $base64);
        $data = base64_decode($base64);

        //生成文件路径
        $name = uniqid() . $ext;            //文件名
        $filepath = "$path/$name";          //相对路径

        //建立文件夹
        self::mkdirs($path);               //建立文件夹(如果不存在)

        //保存图片,并输出结果
        if (file_put_contents($filepath, $data)) {
            return $filepath;
        } else {
            return null;
        }
    }

    /**
     * 按照路径创建文件夹
     * @param $path
     * @return bool
     */
    static private function mkdirs($path){
        //处理相对路径
        if($path == "." || $path == "./" || empty($path))
            return true;

        //获取父路径和文件名
        $info = pathinfo($path);
        $dirname = $info['dirname'];

        //判断父路径是否存在,不存在则递归
        if(!is_dir($dirname))
            self::mkdirs($dirname);

        //检测文件夹是否存在,不存在则新建
        if(!is_dir($path))
            mkdir($path);

        //返回
        return true;
    }

    /**
     * 以API返回形式输出
     * @param int $code
     * @param string $message
     * @param null $data
     */
    static private function sentApiResult($code = 0, $message = "", $data = null)
    {
        //设置文件头(为了兼容AjaxFileUpload不能设置文件头)
        //header('Content-type: application/json');

        //构建返回体
        $result = (object)array(
            "state" => (object)array(
                "code" => $code,
                "massage" => $message,
            ),
            "data" => $data
        );

        //输出内容
        exit(json_encode($result));
    }
}

$upload = Upload::run("upload");
