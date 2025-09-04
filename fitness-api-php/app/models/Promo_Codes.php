<?php
namespace App\models;
use App\Database\DB;
use DateTime;
use Exception;
class Promo_Codes{
  private $tableName = "promo_codes";
  private $db;

  public function __construct() {
    $this->db = new DB($this->tableName);
  }
    public function getAllPromoCodes(){
    try{
      return $this->db
                  ->select()
                  ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }
  public function getPromoCodeById($promoId){  
    try{
      return $this->db
                  ->select()
                  ->where("promoCode_Id" , "=",$promoId)
                  ->getRow();
    }catch(Exception $e){
      return false;
    }
  }
  public function addPromoCode($data) {
    // var_dump($data);
    try {
      return $this->db
                ->insert($data)
                ->excute();
    } catch (Exception $e) {
      // var_dump($e->getMessage());
      return false;
    }
  }
  public function updatePromoCode($id, $data) {
    try {
        $this->db
        ->update($data)
        ->where('promoCode_Id', '=', $id)
        ->excute();
        return true;
    } catch (Exception $e) {
      return false;
    }
  }
  public function deletePromoCode($promoId) {
    try {
      return $this->db
        ->delete()
        ->where('promoCode_id', '=', $promoId)
        ->excute();
    } catch (Exception $e) {
      return false;
    }
  }
  public function searchPromoCode($keyword){
    try{
      $likeKeyword = "%" . $keyword . "%";
      return $this->db
            ->select()
            ->where("promo_code","LIKE",$likeKeyword)
            ->fetchAll();
    }catch(Exception $e){
      return false;
    }
  }

    public function getAllValidPromoCodes(){
      try{
        $today = date("Y-m-d");
        return $this->db
              ->select()
              ->where("start_date","<",$today)
              ->andWhere("end_date",">",$today)
              ->fetchAll();

      }catch(Exception $e){
        return false;
      }
    }
  public function getAllExpiredPromoCodes() {
      try {
          $today = date("Y-m-d");

          return $this->db
              ->select()
              ->where("end_date", "<", $today)
              ->fetchAll();

      } catch (Exception $e) {
          return false;
      }
  }

}
?>