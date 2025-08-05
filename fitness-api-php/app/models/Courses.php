<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Courses{
  private $tableName = "courses";
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
  public function getCourseById($id){
    try{
      return $this->db
                  ->select()
                  ->where("course_id" , "=",$id)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function searchCourses($keyword){
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
public function addCourse($data) {
    try {
      return $this->db
                ->insert($data)
                ->excute();
    } catch (Exception $e) {
      var_dump($e->getMessage()); 
      return false;
    }
  }
  public function updateCourse($id, $data) {
    try {
        $this->db
        ->update($data)
        ->where('course_id', '=', $id)
        ->excute();
        return true;
    } catch (Exception $e) {
      return false;
    }
  }
  public function deleteCourse($id) {
    try {
      return $this->db
        ->delete()
        ->where('course_id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
}
?>