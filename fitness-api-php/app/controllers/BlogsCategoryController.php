<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Blogs_Category;

  class BlogsCategoryController extends AbstractController{
    private $blogsCategoryModel;
    public function __construct(){
      parent::__construct();
      $this->blogsCategoryModel = new Blogs_Category();
    }
    public function getAll(){
      $blogCategories = $this->blogsCategoryModel->AllCategories();
      if($blogCategories === false){
        $this->sendError("Error During Get Blogs Categories");
        return;
      }elseif(empty($blogCategories)){
        $this->sendError("No Category Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Blog Categories Found",
        "data" => $blogCategories
      ]);
    }
    public function showBlogsByCategory($cat_id){
      if (!is_numeric($cat_id) || $cat_id <= 0) {
        $this->sendError("Invalid category ID", 400);
        return;
      }
      
      $Blogs = $this->blogsCategoryModel->getAllBlogsByCatId($cat_id);
      
      if($Blogs === false){
        $this->sendError("Error During Get Blogs - Database query failed", 500);
        return;
      }elseif(empty($Blogs)){
        $response = [
          "status" => "success",
          "message" => "No Blogs found for this category",
          "data" => []
        ];
        return $this->json($response);
      }
      $response = [
        "status" => "success",
        "message" => "All Blogs Found",
        "data" => $Blogs
      ];
      return $this->json($response);
    }

    public function getCategoryById($id){
      $blogCategory = $this->blogsCategoryModel->singleCategory($id);
      if($blogCategory === false){
        $this->sendError("Error During Get Blogs Categories");
        return;
      }elseif(empty($blogCategory)){
        $this->sendError("No Category Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "Category Found",
        "data" => $blogCategory
      ]);
    }
  }
?>