<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Blogs_Category;
  use App\models\Admin;

  class AdminBlogsCategoryController extends AbstractController{
    private $blogsCategoryModel;
    public function __construct(){
      parent::__construct();
      $this->blogsCategoryModel = new Blogs_Category();
    }
    private function requireSuperAdmin(){
      $currentUser = $this->getUserFromToken();
      $adminModel = new Admin();
      $admin = $adminModel->getAdminById($currentUser["id"]);
      // var_dump($admin);
      if( !(isset($admin['is_super_admin']) && $admin['is_super_admin'] == 1)){
        $this->sendError("Not Authorized");
        exit;
      }
    }
    public function getAll(){
      $this->requireSuperAdmin();

      $blogCategories = $this->blogsCategoryModel->AllCategories();
      if($blogCategories === false){
        $this->sendError("Error During Get Blogs Categories");
        return;
      }elseif(empty($categories)){
        $this->sendError("No Category Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Blog Categories Found",
        "data" => $blogCategories
      ]);
    }
    public function searchCategory(){
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
        return;
      }
      $result = $this->blogsCategoryModel
                ->searchInCategory($data["keyword"]);
      if($result === false || empty($result)){
        $this->sendError("Not Found Blogs Category");
        return;
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
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
    public function addCategory(){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"), true);
      if(empty($data)){
        $this->sendError("All Fields Are Required");
        return;
      }
      $added = $this->blogsCategoryModel->addCategory($data);
      if($added === false){
        $this->sendError("Error During Added");
      }
      return $this->json([
        "status" => "success",
        "message"=> "Category Added Successfully"
      ]);
    }
    public function updateCategory($id){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"),true);
      $updated = $this->blogsCategoryModel
                      ->updateCategory($id,$data);
      if(!$updated){

        $this->sendError("Error During Update Category");
        return;
      }
      $this->json([
        "status" => "success",
        "message" => "Category Updated Successfully"
      ]);
    }
    public function deleteCategory($id){
      $this->requireSuperAdmin();
      $isDeleted = $this->blogsCategoryModel
                        ->deleteCategory($id);
      if(!$isDeleted) {
        $this->sendError("Error During Delete Category");
        return;
      }
      $this->json([
        "status"=>"success",
        "message"=>"Delete Category Successfully"
      ]);
    }
  }
?>