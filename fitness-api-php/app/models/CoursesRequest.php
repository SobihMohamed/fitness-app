<?php
namespace App\models;
use App\Database\DB;
use Exception;

class CoursesRequest{
  private $db;
  private $table = "course_applications";

  public function __construct()
  {
    $this->db = new DB($this->table);
  }

  // new request 
  public function create($data){
    try{
      $data['created_at'] = date('Y-m-d');
      $this->db->insert($data)->excute();
      return true;
    }catch(Exception $e){
      return false;
    }
  }

  // get all
  public function getAll(){
    try {
      return $this->db->select()->fetchAll();
    } catch(Exception $e) {
      return false;
    }
  }

  // get request by id with all data of user
  public function showRequestDetails($id){
    try{
      return $this->db
                  ->select()
                  ->join("users","user_id","user_id","u")
                  ->join("courses","course_id","course_id","c")
                  ->where("request_id" , "=",$id)
                  ->getRow();
    }catch(Exception $e) {
      return false;
    }
  }

  // get all requests for a given user searching
  public function getRequestsByUserId($userId){
    try {
      return $this->db
                  ->select()
                  ->where("user_id","=",$userId)
                  ->fetchAll();
    } catch(Exception $e){
      return false;
    }
  }
  public function getSpecificRequestById($req_id){
      try{
        return $this->db
                    ->select()
                    ->where("request_id" , "=",$req_id)
                    ->getRow();
      }catch(Exception $e) {
        return false;
      }
    }
    
  // update status or fields
  public function update($id,$data){
    try {
      return $this->db
                  ->update($data)
                  ->where("request_id","=",$id)
                  ->excute();
    } catch(Exception $e){
      return false;
    }
  }

    // delete a request
  public function delete($id){
    try {
      return $this->db
                  ->delete()
                  ->where("request_id","=",$id)
                  ->excute();
    } catch(Exception $e){
      return false;
    }
  }
}
?>