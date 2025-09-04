<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Blogs_Category{
  private $tableName = "blogs_category";
  private $db;
  public function __construct(){
    $this->db = new DB($this->tableName);
  }
  public function allCategories(){
    try{
      return $this->db
                  ->select()
                  ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function singleCategory($id){
    try{
      return $this->db
                  ->select()
                  ->where("category_Id" , "=",$id)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function searchInCategory($keyword){
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
  public function addCategory($data) {
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
        $this->db
        ->update($data)
        ->where('category_Id', '=', $id)
        ->excute();
        return true;
    } catch (Exception $e) {
      return false;
    }
  }
  public function deleteCategory($id) {
    try {
      return $this->db
        ->delete()
        ->where('category_Id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  } 
}