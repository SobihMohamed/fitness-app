<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Orders {
  private $db;
  private $tablename= "orders";

  public function __construct() {
    $this->db = new DB($this->tablename);
  }

  public function create($data) {
    try {
      $data['purchase_date'] = date('Y-m-d');
      return $this->db->insert($data)->excute();
    } catch (Exception $e) {
      return false;
    }
  }

  public function getByUser($user_id) {
    try {
      return $this->db->select()->where('user_id', '=', $user_id)->fetchAll();
    } catch (Exception $e) {
      return false;
    }
  }
  
  // All data and data of the user and product
  public function getByOrderId($orderId) {
    try {
      return $this->db->select()
      ->join("users","user_id","user_id","u")
      ->join("products","product_id","product_id","p")
      ->where('order_Id', '=', $orderId)
      ->getRow();
    } catch (Exception $e) {
      return false;
    }
  }

  public function getAll() {
    try {
      return $this->db->select()->fetchAll();
    } catch (Exception $e) {
      return false;
    }
  }

  public function getByStatus($status) {
    try {
      return $this->db->select()->where('status', '=', $status)->fetchAll();
    } catch (Exception $e) {
      return false;
    }
  }

  public function update($id,$data){
    try {
      return $this->db
                  ->update($data)
                  ->where("order_id","=",$id)
                  ->excute();
    } catch(Exception $e){
      return false;
    }
  }

  
  public function delete($id){
    try {
      return $this->db
                  ->delete()
                  ->where("order_id","=",$id)
                  ->excute();
    } catch(Exception $e){
      return false;
    }
  }
}
?>