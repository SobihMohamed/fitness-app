<?php
namespace App\models;
use App\Database\DB;
use Exception;
class Chapters{
  private $tableName = "chapters";
  private $db;
  public function __construct(){
    $this->db = new DB($this->tableName);
  }

  public function getAllChapters(){
    try{
      return $this->db
                  ->select()
                  ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function getChapterById($id){
    try{
      return $this->db
                  ->select()
                  ->where("chapter_id" , "=",$id)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function searchChapters($keyword){
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
public function addChapter($data) {
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
  public function updateChapter($id, $data) {
    try {
        $this->db
        ->update($data)
        ->where('chapter_id', '=', $id)
        ->excute();
        return true;
    } catch (Exception $e) {
      return false;
    }
  }
  public function deleteChapter($id) {
    try {
      return $this->db
        ->delete()
        ->where('chapter_id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
}
?>