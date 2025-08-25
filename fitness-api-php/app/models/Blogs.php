<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Blogs{
  private $tableName = "blogs";
  private $db;
  public function __construct(){
    $this->db = new DB($this->tableName);
  }
  public function getAll(){
    try{
      return $this->db
                  ->select()
                  ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function getBlogById($id){
    try{
      return $this->db
                  ->select()
                  ->where("blog_id" , "=",$id)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function searchBlog($keyword){
    try{
      $likeKeyword = "%" . $keyword . "%";
      return $this->db
            ->select()
            ->where("title","LIKE",$likeKeyword)
            ->orWhere("content","LIKE",$likeKeyword)
            ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
public function addBlog($data) {
    try {
      return $this->db
                ->insert($data)
                ->excute();
    } catch (Exception $e) {
      // Log the error message for debugging
      error_log($e->getMessage());
      var_dump($e->getMessage());
      return false;
    }
  }
  public function updateBlog($id, $data) {
    try {
        $this->db
        ->update($data)
        ->where('blog_id', '=', $id)
        ->excute();
        return true;
    } catch (Exception $e) {
      return false;
    }
  }
  public function deleteBlog($id) {
    try {
      return $this->db
        ->delete()
        ->where('blog_id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
}