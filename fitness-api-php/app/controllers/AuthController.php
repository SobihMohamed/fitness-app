<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\User;
use App\Core\JWTHandler;
use Exception;
use PHPMailer\PHPMailer\PHPMailer;
require_once __DIR__ . '/../../vendor/autoload.php';

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
    // Check required fields
    $requiredFields = ['email', 'name', 'password', 'phone', 'user_type'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            return $this->sendError("Field '$field' is required", 422);
        }
    }
    // Normalize email
    $data['email'] = strtolower(trim($data['email']));
    $data['phone'] = trim($data['phone']);
    $data['user_type'] = ucfirst(strtolower(trim($data['user_type'])));

    if (!in_array($data['user_type'], ['Coach', 'Trainee'])) {
        return $this->sendError("Invalid user_type. Must be 'Coach' or 'Trainee'", 422);
    }

    // Check if email already exists
    if ($this->userModel->getUserInfoByEmail($data['email'])) {
        return $this->sendError("Email already exists", 409);
    }

    // Check if phone already exists
    if ($this->userModel->getUserInfoByPhone($data['phone'])) {
        return $this->sendError("Phone number already exists", 409);
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
  public function login() {
      $data = json_decode(file_get_contents("php://input"), true);

      if (empty($data['email']) || empty($data['password'])) {
          return $this->sendError("All Fields are required", 422);
      }
      $user =$this->userModel->Verifylogin($data['email'],$data['password']) ;
      if (empty($user) || !$user ) {
          return $this->sendError("Wrong In Email or Password", 422);
      }
      // Create JWT token
      $jwt = new JWTHandler();
      $token = $jwt->generateToken([
          "id" => $user['user_id'],
          "email" => $user['email']
      ]);
      $this->json([
          "message" => "User Login Successfully",
          "user" => $user,
          "token" => $token,
          "status" => "success"
      ]);
  }
  // after enter email to send otp
  public function forgetPassword(){
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      return $this->sendError("Method Not Allowed From Not Post Request", 405);
    }
    header("Content-Type: application/json");
    //? get all data in body of request
    $data = json_decode(file_get_contents("php://input"),true);
    if(!isset($data['email'])){
      return $this->sendError("Email is Required",400);
    }

    $user = $this->userModel
            ->getUserInfoByEmail($data['email']);

    if(!$user){
      return $this->sendError("User Not Found",404);
    }
    // بعد  ما أتأكدت ان الايميل موجود هعمل الكود اللي يتعبت علي ايميله بعد كدا
  
    $otp = rand(100000,999999);
    $this ->userModel
          ->saveOtp($data['email'],$otp);
    //! خطوات ارسال الكود لل الايميل 
    $mail = new PHPMailer(true);
    try{
      $mail->isSMTP();
      $mail->Host='smtp.gmail.com';
      $mail->SMTPAuth=true;
      $mail->Username='sobihmohamedsobih@gmail.com';
      $mail->Password='dpxctdbonnagdprc';
      $mail->SMTPSecure = 'tls';
      $mail->Port = 587;
      $mail->setFrom('sobihmohamedsobih@gmail.com', 'Gym OTP Sender'); 
      $mail->addAddress($data['email']);                 
      $mail->Subject = 'Reset Your Password - OTP';
      $mail->Body    = "Hello,\nYour OTP code is: $otp\n.";
      $mail->send();

      $this->json([
        "status" => "success",
        "message" => "OTP sent ot your email",
        // "otp"=>$otp // مؤقت هيتشال
      ],200);
    }catch(Exception $e){
      return $this->sendError("Email could not be sent. Mailer Error: {$mail->ErrorInfo}", 500);
    }
  }
  // after enter the otp and new password
  public function verifyOtpAndUpdatePassword(){
    if($_SERVER["REQUEST_METHOD"] !== "POST"){
      return $this->sendError("Method Not Allowed From Not Post Request", 405);
    }
    // get all data 
    $data = json_decode(file_get_contents("php://input"),true);
    if(empty($data['email']) || empty($data['otp']) || empty($data['newPassword'])){
      return $this->sendError("All field are required", 422);
    }
    $isValid = $this->userModel
                    ->verifyOtp($data['email'],$data['otp']);
    if(!$isValid || empty($isValid)){
      return $this->sendError("Incorrect OTP Or Email", 422);
    }
    $isupdated = $this -> userModel
          ->updatePassword($data['email'],$data['newPassword']);
    if(!$isupdated){
      return $this->sendError("Error During Update Password", 500);
    }

    $this->json([
      "status" => "success",
      "message" => "password Updated Successfully"
    ]);
  }
}

?>