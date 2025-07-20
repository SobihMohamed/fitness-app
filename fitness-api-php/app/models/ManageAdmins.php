<?php
namespace App\models;
use App\Database\DB;
use Exception;

class ManageAdmins{
  protected $db;
  protected $tableName = "admins";

  public function __construct(){
    $this->db = new DB($this->tableName);
  }

  // ! admin Actions by Super admins
  public function getAllAdmins(){
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
  public function searchAdmin($keyword){
    try{
      $likeKeyword = "%" . $keyword . "%";
      return $this->db
            ->select()
            ->where("name","LIKE",$likeKeyword)
            ->orWhere("email","LIKE",$likeKeyword)
            ->fetchAll()
        ? : false;
    }catch(Exception $e){
      return false;
    }
  }
  public function getAdminById($id){
    try{
      return
      $this->db
            ->select()
            ->where("admin_id","=",$id)
            ->getRow()
        ?:false;
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
              ->where("admin_id","=",$id)
              ->excute();
      return true;
    }catch(Exception $e){
      return false;
    }
  }
  public function addAdmin($data){
    try{
      if(!$this->isExist($data["email"])){
        $this->db
        ->insert($data)->excute();
        return true;
      }else{
        return false;
      }
    }catch(Exception $e){
      return $e;
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
}
?>