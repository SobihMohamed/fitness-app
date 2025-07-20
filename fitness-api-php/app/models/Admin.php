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
  // ! Admins action by super admin
  // ? get All Admins
  public function getAllAdmins(){
    try{
      return
      $this->db
      ->select()
      ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function addAdmin($data){
    try{
      if(!$this->isExist($data["email"],"admins")){
        $this->db->insert($data);
        return true;
      }else{
        return false;
      }
    }catch(Exception $e){
      return $e;
    }
  }
  public function searchAdmin($keyword){
    try{
      $likeKeyword = "%" . $keyword . "%";
      $adminsSearched = $this->db
                              ->select()
                              ->where("name","LIKE",$likeKeyword)
                              ->orWhere("email","LIKE",$likeKeyword)
                              ->fetchAll();
      return $adminsSearched ? : false;
    }catch(Exception $e){
      return false;
    }
  }
  public function deleteAdmin($id){
    try{
      $this->db
              ->delete()
              ->where("admin_id","=",$id)
              ->excute();
      return true;
    }catch(Exception $e){
      return false;
    }
  }
  public function updateAdmin($id,$data){
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
  public function getAdminById($id){
    try{
      return $this->db
            ->select()
            ->where("user_id","=",$id)
            ->getRow();
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
  public function isSuperAdmin($admin) {
    $admin_to_check_id = $admin['id'];
    $Admin = $this->getAdminById($admin_to_check_id);
    if(empty($Admin)){
      return false;
    }
    return true;
  }
}
?>