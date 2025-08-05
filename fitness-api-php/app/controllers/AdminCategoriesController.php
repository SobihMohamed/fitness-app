<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Category;
  use App\models\Admin;

  class AdminCategoriesController extends AbstractController{
    private $categoryModel;
    public function __construct(){
      parent::__construct();
      $this->categoryModel = new Category();
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

      $categories = $this->categoryModel->getAllCategories();
      if($categories === false){
        $this->sendError("Error During Get Categories");
        return;
      }elseif(empty($categories)){
        $this->sendError("No Category Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Categories Found",
        "data" => $categories
      ]);
    }
    public function addCategory(){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"), true);
      if(empty($data)){
        $this->sendError("All Fields Are Required");
        return;
      }
      $added = $this->categoryModel->addCategory($data);
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
      $updated = $this->categoryModel
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
      $isDeleted = $this->categoryModel
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