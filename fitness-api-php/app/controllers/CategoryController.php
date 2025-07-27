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
      $products = $this->categoryModel->getAllProductsByCatId($cat_id);
      if($products === false){
        $this->sendError("Error During Get products");
      }elseif(empty($products)){
        $this->sendError("No Category Found",404);
      }
      return $this->json([
        "status" => "success",
        "message" => "All products Found",
        "data" => $products
      ]);
    }
  }
?>