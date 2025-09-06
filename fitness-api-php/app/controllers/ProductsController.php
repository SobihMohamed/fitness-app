<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Product;
  use App\models\Category;
  use App\models\Product_sub_images;
  
  class ProductsController extends AbstractController{
    private $productModel;
    private $product_subImages;
    private $categroyModel;

    public function __construct(){
      $this->productModel = new Product();
      $this->product_subImages = new Product_sub_images();
      $this->categroyModel = new Category();
    }
    
    public function getAll(){
      $products = $this->productModel->getAllProducts();
      if($products === false){
        $this->sendError("Error During Get Products");
        return;
      }elseif(empty($products)){
        $this->sendError("No Products Found",404);
        return;
      }
      foreach ($products as &$prod) {
        $category = $this->categroyModel->getCategoryById($prod['category_id']);
        $prod['category_name'] = $category['name'] ?? null;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Products Found",
        "data" => $products
      ]);
    }

    public function SingleProduct($id){
      $Product = $this->productModel
              ->getProductById($id);
      if($Product === false){
          $this->sendError("Error During Find Product");
          return;
      }
      $subImages = $this->product_subImages->getByProductId($id);
      $Product['sub_images'] = array_map(function($img){
        return $img['sub_image_url'];
      },$subImages?: []);
      
      $category = $this->categroyModel->getCategoryById($Product['category_id']);
      $Product['category_name'] = $category['name'] ?? null;
      
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