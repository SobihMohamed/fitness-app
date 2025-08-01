<?php
namespace App\Controllers;

use App\Core\AbstractController;
use App\models\Notifications;

class NotificationsController extends AbstractController {
    protected $notifModel;

    public function __construct() {
        parent::__construct();
        $this->notifModel = new Notifications();
    }
    // GET /user/notifications
    public function getNotificationForUser() {
        $user = $this->getUserFromToken();
        $notifications = $this->notifModel->getByUserId($user['id']);
        return $this->json([
            'status' => 'success',
            'data'   => $notifications
        ]);
    }
    // DELETE notifications/{id}
    public function delete($id) {
        $user = $this->getUserFromToken();
        // تأكد إن الإشعار يخص اليوزر ده
        $notif = $this->notifModel->getById($id);
        if (!$notif || $notif['user_id'] != $user['id']) {
            return $this->sendError("Not found or forbidden", 404);
        }
        $ok = $this->notifModel->delete($id);
        if (!$ok) {
            return $this->sendError("Cannot delete", 500);
        }
        return $this->json([
            'status' => 'success',
            'message' => 'Notification deleted'
        ]);
    }
  }
?>