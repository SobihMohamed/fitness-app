<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\User;

class AuthController extends AbstractController{
  protected $userModel;
  public function __construct(){
    parent::__construct(); // to put the headers
    $this->userModel = new User();
  }

  public function register(){
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->sendError("Method Not Allowed", 405);
        }
    //? get all data in body of request
    $data = json_decode(file_get_contents("php://input"),true);
    file_put_contents("debug.txt", json_encode($data)); // Debug
    if(empty($data['email']) || empty($data['name']) || empty($data['password']) ){
      return $this->sendError("All Fields are required" , 422);
    }
    // Normalize email
    $data['email'] = strtolower($data['email']);

    $isExist =  $this->userModel
                ->getUserInfoByEmail($data['email']);
    if($isExist){
      return $this->sendError("Email Already Exist",409);
    }

    $regesterSuccess = $this->userModel
                ->register($data);
    if(!$regesterSuccess){
      return $this->sendError("Error During Register",500);
    }

    $this->json([
      "message"=>'User Registered Successfully',
      "status"=>"success"
    ],201);
  }

  public function login(){
    $data = json_decode(file_get_contents("php://input"),true);
    if(empty($data['email']) || empty($data['password']) ){
      return $this->sendError("All Fields are required" , 422);
    }
    $isExist =  $this->userModel
                ->getUserInfoByEmail($data['email']);
    if(!$isExist){
      return $this->sendError("Email Not Exist ",422);
    }
    // ? return user 
    $user= $this->userModel
                  ->login($data['email'],$data['password']);
    if(!$user){
      return $this->sendError("Incorrect Email or Password",401);
    }
    $this->json([
      "message"=> "user Login Successfully",
      "user"=>$user,
      "status"=>"success"
    ]);
  }

  public function logout(){
    $isLoggedout = $this->userModel
                ->logout();
    if(!$isLoggedout){
      return $this->sendError("Error During Logout",500);
    }
    $this->json([
      "message"=>"loggedOut Success",
      "status"=>"success"
    ]);
  }
}

?>