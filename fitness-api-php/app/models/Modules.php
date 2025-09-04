<?php
namespace App\models;
use App\Database\DB;
use Exception;
class Modules{
  private $tableName = "modules";
  private $db;
  public function __construct(){
    $this->db = new DB($this->tableName);
  }

  public function getAllModules(){
    try{
      return $this->db
                  ->select()
                  ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function getModuleById($id){
    try{
      return $this->db
                  ->select()
                  ->where("module_id" , "=",$id)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function searchModules($keyword){
    try{
      $likeKeyword = "%" . $keyword . "%";
      return $this->db
            ->select()
            ->where("title","LIKE",$likeKeyword)
            ->orWhere("description","LIKE",$likeKeyword)
            ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
public function addModule($data) {
    try {
      return $this->db
                ->insert($data)
                ->excute();
    } catch (Exception $e) {
      // Log the error message for debugging
      error_log($e->getMessage());
      return false;
    }
  }
  public function updateModule($id, $data) {
    try {
        $this->db
        ->update($data)
        ->where('module_id', '=', $id)
        ->excute();
        return true;
    } catch (Exception $e) {
      return false;
    }
  }
  public function deleteModule($id) {
    try {
      return $this->db
        ->delete()
        ->where('module_id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
}
?>