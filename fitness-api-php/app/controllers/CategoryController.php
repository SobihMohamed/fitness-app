<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Category;
  
  class CategoryController extends AbstractController{
    private $categoryModel;
    
    public function __construct(){
      $this->categoryModel = new Category();
    }

    public function getAll(){
      $categories = $this->categoryModel->getAllCategories();
      if($categories === false){
        $this->sendError("Error During Get Categories");
      }elseif(empty($categories)){
        $this->sendError("No Category Found",404);
      }
      return $this->json([
        "status" => "success",
        "message" => "All Categories Found",
        "data" => $categories
      ]);
    }

      public function showProductsByCategory($cat_id){
      if (!is_numeric($cat_id) || $cat_id <= 0) {
        $this->sendError("Invalid category ID", 400);
        return;
      }
      
      $products = $this->categoryModel->getAllProductsByCatId($cat_id);
      
      if($products === false){
        $this->sendError("Error During Get products - Database query failed", 500);
        return;
      }elseif(empty($products)){
        $response = [
          "status" => "success",
          "message" => "No products found for this category",
          "data" => []
        ];
        return $this->json($response);
      }
      $response = [
        "status" => "success",
        "message" => "All products Found",
        "data" => $products
      ];
      error_log("Category products response: " . json_encode($response));
      return $this->json($response);
    }
  }
?>