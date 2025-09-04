<?php
namespace App\models;
use App\Database\DB;
use Exception;

  class Product_sub_images{
    private $tableName = "product_sub_images";
    private $db;

    public function __construct(){
      $this->db = new DB($this->tableName);
    }

    public function addSubImage($product_id,$subImageUrl){
      try{
        $data = [
          "product_id" => $product_id,
          "sub_image_url" => $subImageUrl
        ];
        return $this->db->insert($data)->excute();
      }catch(Exception $e){
        return false;
      }
    }

    public function getByProductId($id){
      try{
        return $this->db->select()->where("product_id	","=",$id)->fetchAll();
      }catch(Exception $e){
        return false;
      }
    }
    public function deleteByProductId($productId) {
        return $this->db->delete()
                        ->where("product_id", "=", $productId)
                        ->excute();
    }
  }
?>