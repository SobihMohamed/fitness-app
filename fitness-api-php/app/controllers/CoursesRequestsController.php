<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\CoursesRequest;
use App\Helpers\NotifyHelper;
class CoursesRequestsController extends AbstractController {
  protected $reqModel;

  public function __construct(){
    parent::__construct();
    $this->reqModel = new CoursesRequest();
  }

   // POST /user/requests  (submit new) required user_id in hidden and all data
  public function create(){
    $user = $this->getUserFromToken();
    if ($_SERVER['REQUEST_METHOD']!=='POST')
      return $this->sendError("Invalid",405);

    $data = json_decode(file_get_contents("php://input"), true);
    $data['user_id'] = $user['id'];
    $ok = $this->reqModel->create($data);
    if (!$ok) 
      return $this->sendError("Cannot submit request",500);

    // NotifyHelper::pushToAllAdmins("طلب اشتراك في كورس جديد",
    //                               "طلب اشتراك في كورس جديد من المستخدم {$user['email']}"
    //                             );
                                
    return $this->json(["status"=>"success","message"=>"Request submitted"]);
  }
  //get requests sent
  public function getMyRequests(){
    $user = $this->getUserFromToken();
    $requests = $this->reqModel->getRequestsByUserId($user['id']);
    if(!$requests || $requests === false){
      $this->sendError("No Requests Found" ,404 );
      return;
    }
      return $this->json(["status"=>"success","data"=>$requests]);
  }
}
?>