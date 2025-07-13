<?php
namespace App\Core;
Class App{
  protected $controller = "HomeController";
  protected $method = "index";
  protected $params = [];

  public function __construct(){
    // http://localhost:8000/trainer/index/
    //?  trainer/index/
    $url =$this->parseUrl();
    file_put_contents("log.txt", "URL Detected: " . implode("/", $url));
    
    //Handel Controller 
    if(!empty($url[0])){
      $controllerName = ucfirst($url[0])."Controller";
      $controllerFile = "../app/controllers/".$controllerName.".php";

      if(file_exists($controllerFile)){
        $this->controller = $controllerName;
        unset($url[0]);
      }else{
        $this->sendJsonError("Controller not found",404);
        exit;
      }
}

    $controllerClass = "App\\Controllers\\".$this->controller;
    $this->controller = new $controllerClass;

    // Hndel Methods
    if(!empty($url[1])){
      if(method_exists($this->controller,$url[1])){
        $this->method = $url[1];
        unset($url[1]);
      }else{
        $this->sendJsonError("Controller not foound",404);
        exit;
      }
    }
    // handel Params since, we make unset for the url so check if has value it must be Params
    $this->params = $url ? array_values($url) : [];

    // call method in class 
    call_user_func_array([$this->controller,$this->method],$this->params);
  }

  // extract and process the URL path from the browser address bar so
  // that the app can determine which controller, method, and parameters to use.
  private function parseUrl() {
    if (isset($_SERVER['REQUEST_URI'])) {
        // احذف الـ base path لو شغال داخل /public
        $url = str_replace('/public', '', $_SERVER['REQUEST_URI']);
        // احذف أي query params مثل ?id=1
        $url = strtok($url, '?');
        // احذف أول / لو فيه
        $url = trim($url, '/');

        if (!empty($url)) {
            file_put_contents("log.txt", "URL Detected: " . $url); // Debug
            return explode('/', $url);
        }
    }
    return [];
}


  private function sendJsonError($msg,$code){
    http_response_code($code);
    header("Content-Type: application/json");
    echo json_encode([
      "status"=>"error",
      "message"=> $msg,
    ]);
  }
}
?>