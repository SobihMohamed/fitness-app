<?php
namespace App\models;
use App\Database\DB;
use Exception;

class Notifications{
  private $db;
  private $tableName= "notifications";
  public function __construct() {
    $this->db = new DB($this->tableName);
  }

  public function create($data) {
    try {
        if (empty($data['message_title']) || empty($data['content'])) {
            return false;
        }
        return (bool) $this->db->insert($data)->excute();
    } catch (Exception $e) {
        error_log('Notification Create Error: ' . $e->getMessage());
        return false;
    }
  }
  public function getAll() {
    try {
        return $this->db->select()->fetchAll();
    } catch (Exception $e) {
        error_log('Notification GetAll Error: ' . $e->getMessage());
        return false;
    }
  }
  public function getByUserId($userId) {
    try {
        return $this->db->select()
                        ->where('user_id', '=', $userId)
                        ->fetchAll();
    } catch (Exception $e) {
        error_log('Notification getByUserId Error: ' . $e->getMessage());
        return false;
    }
  }
  public function getById($id){
    try {
        return $this->db->select()
                        ->where('notification_id', '=', $id)
                        ->getRow();
    } catch (Exception $e) {
        error_log('Notification getByUserId Error: ' . $e->getMessage());
        return false;
    }
  }
  public function delete($id) {
    try {
        return $this->db->delete()
                    ->where('notification_id', '=', $id)
                    ->excute();
    } catch (Exception $e) {
        error_log('Notification Delete Error: ' . $e->getMessage());
        return false;
    }
  }
}

?>