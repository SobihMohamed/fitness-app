<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Admin{
  protected $db;
  protected $tableName = "admins";

  public function __construct(){
    $this->db = new DB($this->tableName);
  }
  //? Users Actions by Admin 
  public function getAllUsers(){
    try{
      $usersDB = new DB("users");
      $allUsers = $usersDB
      ->select()
      ->fetchAll();
      return $allUsers ? : false;
    }catch(Exception $e){
      return false;
    }
  }
  public function searchUser($keyword){
    try{
      $userDB = new DB("users");
      $likeKeyword = "%" . $keyword . "%";
      $usersSearched = $userDB->select()
                              ->where("name","LIKE",$likeKeyword)
                              ->orWhere("email","LIKE",$likeKeyword)
                              ->fetchAll();
      return $usersSearched ? : false;
    }catch(Exception $e){
      return false;
    }
  }
  public function getUserById($id){
    try{
      $userDB = new DB("users");
      $singleUser = $userDB->select()
                    ->where("user_id","=",$id)
                    ->getRow();
      return $singleUser;
    }catch(Exception $e){
      return false;
    }
  }
  public function deleteUser($id){
    try{
      $userDB = new DB("users");
      $userDB ->delete()
              ->where("user_id","=",$id)
              ->excute();
      return true;
    }catch(Exception $e){
      return false;
    }
  }
  public function updateUser($id,$data){
    try{
      $userDB = new DB("users");
      $userDB ->update($data)
              ->where("user_id","=",$id)
              ->excute();
      return true;
    }catch(Exception $e){
      return false;
    }
  }
  public function addUser($data){
    try{
      if(!$this->isExist($data["email"],"users")){
        $userDB = new DB("users");
        $userDB->insert($data)->excute();
        return true;
      }else{
        return false;
      }
    }catch(Exception $e){
      return $e;
    }
  }
  // ? get All Admins
  public function getAllAdmins(){
    try{
      $adminsDB = new DB("admins");
      $allAdmins = $adminsDB
      ->select()
      ->fetchAll();
      return $allAdmins ? : false;
    }catch(Exception $e){
      return false;
    }
  }
  // ? get users coach or trainee
  public function getUsersByType($type){
    try{
      $userDB = new DB("users");
      $usersByType = $userDB->select()
                            ->where("userType","=",$type)
                            ->fetchAll();
      return $usersByType ? : false;
    }catch(Exception $e){
      return false;
    }
  }
  // ? check if exist ?
  public function isExist($email,$table){
    try{
      $theTable = new DB ($table);
      $isReturn = $theTable->select()
                  ->where("email","=",$email)
                  ->fetchAll();
      return $isReturn ? : false;
    }catch(Exception $e){
      return $e->getMessage();
    }
  }
}
?>