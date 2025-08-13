<?php
namespace App\models;
use App\Database\DB;
use Exception;
class ManageUsers {
  protected $db;
  protected $tableName = "users";


  public function __construct(){
    $this->db = new DB($this->tableName);
  }

  // ! User Actions by admins
  public function getAllUsers(){
    try{
      return
          $this->db
                ->select()
                ->fetchAll()
          ? : false;
    }catch(Exception $e){
      return false;
    }
  }
  public function searchUser($keyword){
    try{
      $likeKeyword = "%" . $keyword . "%";
      return $this->db
            ->select()
            ->where("name","LIKE",$likeKeyword)
            ->orWhere("email","LIKE",$likeKeyword)
            ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function getUserById($id){
    try{
      return
      $this->db
            ->select()
            ->where("user_id","=",$id)
            ->getRow()
        ?:false;
    }catch(Exception $e){
      return false;
    }
  }
  public function deleteUser($id){
    try{
      $this->db
              ->delete()
              ->where("user_id","=",$id)
              ->excute();
      return true;
    }catch(Exception $e){
      return false;
    }
  }
  public function updateUser($id,$data){
    try{
      $this->db
              ->update($data)
              ->where("user_id","=",$id)
              ->excute();
      return true;
    }catch(Exception $e){
      return false;
    }
  }
  public function addUser($data){
    try{
      if(!$this->isExist($data["email"])){
        $this->db
        ->insert($data)->excute();
        return true;
      }else{
        return false;
      }
    }catch(Exception $e){
      return false;
    }
  }
  public function isExist($email){
    try{
      return
      $this->db
            ->select()
            ->where("email","=",$email)
            ->fetchAll()
          ? : false;
    }catch(Exception $e){
      return $e->getMessage();
    }
  }
    // ? get users coach or trainee
  public function getUsersByType($type){
    try{
      return
      $this->db
            ->select()
            ->where("user_type","=",$type)
            ->fetchAll()
      ? : false;
    }catch(Exception $e){
      return false;
    }
  }
  

}
?>