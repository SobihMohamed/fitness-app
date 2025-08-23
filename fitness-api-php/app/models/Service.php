<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Service{
  private $tableName = "services";
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
  public function getServiceById($id){
    try{
      return $this->db
                  ->select()
                  ->where("service_id" , "=",$id)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function searchService($keyword){
    try{
      $likeKeyword = "%" . $keyword . "%";
      return $this->db
            ->select()
            ->where("details","LIKE",$likeKeyword)
            ->orWhere("title","LIKE",$likeKeyword)
            ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
public function addService($data) {
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
  public function updateService($id, $data) {
    try {
        $this->db
        ->update($data)
        ->where('service_id', '=', $id)
        ->excute();
        return true;
    } catch (Exception $e) {
      return false;
    }
  }
  public function deleteService($id) {
    try {
      return $this->db
        ->delete()
        ->where('service_id', '=', $id)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
}