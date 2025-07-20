<?php
namespace App\Core;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;
class JWTHandler{
  private static $secretKey = "fT3$92hL!mX#QpZ7vRc9&uG5bK@dWxAy";
  private static $algo = 'HS256';
  private static $expire_time = 60*60*24;
  public static function generateToken($payload){
    $issuedAt = time();
    $payload['iat'] = $issuedAt;
    $payload['exp'] = $issuedAt + self::$expire_time;
    return JWT::encode($payload,self::$secretKey,self::$algo); 
  }
  public static function verifyToken($token){
    try{
      return JWT::decode($token,new Key(self::$secretKey,self::$algo));
    }catch(Exception $e){
      return null;
    }
  }
}
?>