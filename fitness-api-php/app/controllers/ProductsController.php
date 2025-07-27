<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Product;
  
  class ProductsController extends AbstractController{
    private $productModel;

    public function __construct(){
      $this->productModel = new Product();
    }
    
    public function getAll(){
      $Products = $this->productModel->getAllProducts();
      if($Products === false){
        $this->sendError("Error During Get Products");
      }elseif(empty($Products)){
        $this->sendError("No Products Found",404);
      }
      return $this->json([
        "status" => "success",
        "message" => "All Products Found",
        "data" => $Products
      ]);
    }

    public function SingleProduct($id){
      $Product = $this->productModel
              ->getProductById($id);
      if($Product === false){
        $this->sendError("Error During Find Product");
        return;
      }
      return $this->json([
        "status" => "success",
        "Product" => $Product
      ]);
    }

      public function searchProduct(){
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
        return;
      }
      $result = $this->productModel
                ->searchProduct($data["keyword"]);
      if($result === false || empty($result)){
        $this->sendError("Not Found Products");
        return;
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }
  }
?>