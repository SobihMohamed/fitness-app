<?php
namespace App\models;
use App\Database\DB;
use Exception;

class User {
  protected $db;
  protected $tableName = "users";

  public function __construct(){
    $this->db = new DB($this->tableName);
  }
  public function register($data){
    try{
      $data['password']= password_hash($data['password'],PASSWORD_BCRYPT);
      // $data['level'] = $data['level'] ?? 'user';
      $this->db
          ->insert($data)
          ->excute();
          return true;
    }catch(Exception $e){
      echo "DB Error: " . $e->getMessage();
      return false;
    }
  }
  public function getUserInfoByEmail($email){
    try{
      $userInfo = $this->db
                  ->select("*")
                  ->where("email","=",$email)
                  ->getRow();
      // print_r($userInfo);
      return $userInfo?:false;  
    }catch(Exception $e){
      return false;
    }
  }
  public function updatePassword($email,$updatedPassword){
    try{
      $updatedPassword = password_hash($updatedPassword,PASSWORD_BCRYPT);
      $this ->db
            ->update(["password"=>$updatedPassword])
            ->where("email","=",$email)
            ->excute();
      return true;
    }catch(Exception $e){
      return false;
    }

  }
    public function login($email,$Password){
    try{
      $user = $this->getUserInfoByEmail($email);
      if(!$user || !password_verify($Password,$user['password'])){
        return false;
      }
      $_SESSION['user'] = [
        'id'=>$user['user_id'],
        'name'=>$user['name'],
        'email'=>$user['email']
      ];
      return $_SESSION['user'];
    }catch(Exception $e){
      return false;
    }
  }
  public function logout(){
    try {
        if(isset($_SESSION['user'])){
            unset($_SESSION['user']);
        }
        session_destroy();
        return true;
    } catch(Exception $e){
      return false;
    }
}


}
?>