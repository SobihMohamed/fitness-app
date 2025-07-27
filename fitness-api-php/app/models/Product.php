<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Product{
  private $tableName = "products";
  private $db;

  public function __construct(){
    $this->db = new DB($this->tableName); 
  }

  public function getAllProducts(){
    try{
      return $this->db
                  ->select()
                  ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function getProductById($prodId){  
    try{
      return $this->db
                  ->select()
                  ->where("product_id" , "=",$prodId)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function addProduct($data) {
    try {
      return $this->db
                ->insert($data)
                ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
  public function updateProduct($id, $data) {
    try {
        $this->db
        ->update($data)
        ->where('product_id', '=', $id)
        ->excute();
        return true;
    } catch (Exception $e) {
      return false;
    }
  }
  public function deleteProduct($id) {
    try {
      return $this->db
        ->delete()
        ->where('product_id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
  public function searchProduct($keyword){
    try{
      $likeKeyword = "%" . $keyword . "%";
      return $this->db
            ->select()
            ->where("name","LIKE",$likeKeyword)
            ->orWhere("description","LIKE",$likeKeyword)
            ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
}
?>