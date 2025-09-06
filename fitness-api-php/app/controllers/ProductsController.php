<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Product;
  use App\models\Product_sub_images;
  
  class ProductsController extends AbstractController{
    private $productModel;
    private $product_subImages;

    public function __construct(){
      $this->productModel = new Product();
      $this->product_subImages = new Product_sub_images();
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
      $subImages = $this->product_subImages->getByProductId($id);
      if($Product === false){
        $this->sendError("Error During Find Product");
        return;
      }
      $Product['sub_images'] = array_map(function($img) {
        return $img['sub_image_url'];
      }, $subImages ?: []);

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