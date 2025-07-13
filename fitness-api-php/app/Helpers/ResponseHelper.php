<?php
namespace App\Helpers;
class ResponseHelper{
  public static function json($data,int $status = 200){
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode($data);
  }
  public static function error(string $msg,int $status = 400){
    self::json([
      'status' => 'error',
      'message' => $msg
    ], $status);
  }
  
}

?>