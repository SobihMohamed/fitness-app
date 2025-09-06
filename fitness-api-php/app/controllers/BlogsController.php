<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Blogs;
  use App\models\Blogs_Category;
  
  class BlogsController extends AbstractController{
    private $blogModel;
    private $blogCategoryModel;

    public function __construct(){
      $this->blogModel = new Blogs();
      $this->blogCategoryModel = new Blogs_Category();
    }
    public function getAll(){
      $Blogs = $this->blogModel->getAll();
      if($Blogs === false){
        $this->sendError("Error During Get Blogs");
      }elseif(empty($Blogs)){
        $this->sendError("No Blogs Found",404);
      }
      // نشيل admin_id من كل blog
      foreach ($Blogs as &$blog) {
          unset($blog['admin_id']);
      }
      return $this->json([
        "status" => "success",
        "message" => "All Blogs Found",
        "data" => $Blogs
      ]);
    }

    public function singleBlog($id){
      $Blog = $this->blogModel
              ->getBlogById($id);
      if($Blog === false){
        $this->sendError("Error During Find Blog");
        return;
      }
        // نشيل admin_id من كل blog
        unset($Blog['admin_id']);
        $category = $this->blogCategoryModel->singleCategory($Blog['category_id']);

        $Blog['category_name'] = $category['name']??null;

      return $this->json([
        "status" => "success",
        "Blog" => $Blog
      ]);
    }

      public function searchBlog(){
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
        return;
      }
      $result = $this->blogModel
                ->searchBlog($data["keyword"]);
      if($result === false || empty($result)){
        $this->sendError("Not Found Blogs");
        return;
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }

  }
?>