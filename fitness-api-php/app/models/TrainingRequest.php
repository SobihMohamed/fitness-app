<?php
namespace App\models;
use App\Database\DB;
use Exception;

class TrainingRequest{
  private $db;
  private $table = "training_requests";

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
      var_dump($e->getMessage());
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

  // get request by id with all data of user
  public function showRequestDetails($id){
    try{
      return $this->db
                  ->select()
                  ->join("users","user_id","user_id","u")
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

  //get expifing before 2 days
  public function getExpiringSoon() {
    $today = date('Y-m-d');
    $afterTwoDays = date('Y-m-d', strtotime('+2 days'));
    try {
        return $this->db->select()
            ->where("end_date", ">=", $today)
            ->andWhere("end_date", "<=", $afterTwoDays)
            ->andWhere("status", "=", "approved")
            ->andWhere("isExpired", "=", "0")
            ->fetchAll();
    } catch (Exception $e) {
        return false;
    }
  }


  // update set isExpired to 1
  public function updateExpiredStatuses() {
  $today = date('Y-m-d');
    try{
      return $this->db->update(["isExpired" => 1])
      ->where("end_date","<",$today)
      ->andWhere("status","=","approved")
      ->andWhere("isExpired","=","0")
      ->excute();
    }catch(Exception $e){
      return false;
    }
  }
}
?>