<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Category{
  private $tableName = "categorys";
  private $db;
  public function __construct(){
    $this->db = new DB($this->tableName);
  }

  public function getAllCategories(){
    try{
      return $this->db
                  ->select()
                  ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function getAllProductsByCatId($categId){
    if (!is_numeric($categId) || $categId <= 0) {
      return false;
    }
    
    $productDB = new DB("products");
    try{
      $result = $productDB
              ->select()
              ->where("category_id" , "=" , $categId)
              ->fetchAll();
      return $result !== false ? $result : [];
    }catch(Exception $e){
      error_log("Database error in getAllProductsByCatId: " . $e->getMessage());
      return false;
    }
  }
  public function getCategoryById($catId){  
    try{
      return $this->db
                  ->select()
                  ->where("category_id" , "=",$catId)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function addCategory($data) {
    if(!$data['name'])
      return false;
    try {
      return $this->db
                ->insert($data)
                ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
  public function updateCategory($id, $data) {
    try {
      return $this->db
        ->update($data)
        ->where('category_id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
  public function deleteCategory($id) {
    try {
      return $this->db
        ->delete()
        ->where('category_id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }

}
?>