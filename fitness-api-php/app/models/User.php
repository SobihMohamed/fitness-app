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
      return $userInfo;  
    }catch(Exception $e){
      return false;
    }
  }
  public function getUserInfoById($id){
    try{
      $userInfo = $this->db
                  ->select("*")
                  ->where("user_id","=",$id)
                  ->getRow();
      // print_r($userInfo);
      return $userInfo;  
    }catch(Exception $e){
      return false;
    }
  }
  public function getUserInfoByPhone($phone) {
    try{
      $userInfo = $this->db
                  ->select("*")
                  ->where("phone","=",$phone)
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
  public function Verifylogin($email,$Password){
    try{
      $user = $this->getUserInfoByEmail($email);
      if(!$user || !password_verify($Password,$user['password'])){
        return false;
      }
      return $user;
    }catch(Exception $e){
      return false;
    }
  }
  public function saveOtp($email ,$otp){
    $newDBResets = new DB("password_resets");
    $newDBResets->insert([
      'email'=>$email,
      'otp'=>$otp,
      'created_at' => date('Y-m-d H:i:s')
    ])->excute();
    return true;
  }
  public function verifyOtp($email, $otp) {
    try{

      $db = new DB('password_resets');
      $result = $db->select()
      ->where('email', '=', $email)
      ->andWhere('otp', '=', $otp)
      ->getRow(); 
      return $result;
    }catch(Exception $e){
      return false;
    }
  }

  public function updateUserInfoByEmail($email,$data){
    try{
      if(empty($data)){
        return false;
      }
      $this->db
          ->update($data)
          ->where("email","=",$email)
          ->excute();
      return true;
    }catch(Exception $e){
      return false;
    }
  }
}
?>