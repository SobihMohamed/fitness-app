<?php
namespace App\Helpers;

use App\Models\Notifications;
use App\Models\Admin;
use App\Models\ManageUsers;

class NotifyHelper {

    public static function pushToAdmin($adminId, $title, $content) {
        $notif = new Notifications();

        $notif->create([
            'message_title' => $title,
            'content' => $content
        ], [
            ['admin_id' => (int)$adminId]
        ]);
    }

    public static function pushToSpecificUser($userId, $title, $content) {
        $notif = new Notifications();

        $notif->create([
            'message_title' => $title,
            'content' => $content
        ], [
            ['user_id' =>(int) $userId]
        ]);
    }

    public static function pushToBoth($userId, $adminId, $title, $content) {
        $notif = new Notifications();

        $notif->create([
            'message_title' => $title,
            'content' => $content
        ], [
            ['user_id' => $userId],
            ['admin_id' => $adminId]
        ]);
    }

    public static function pushToAllAdmins($title, $content ,$excludeAdminId = null) {
        $notif = new Notifications();
        $adminModel = new Admin();
        $admins = $adminModel->getAllAdmins();

        $recipients = [];

        foreach ($admins as $admin) {
          if ($excludeAdminId && $admin['admin_id'] == $excludeAdminId) {
            continue; // استبعد الأدمن اللي أرسل الإشعار
          }
          $recipients[] = ['admin_id' => (int)$admin['admin_id']];
        }

        $notif->create([
            'message_title' => $title,
            'content' => $content
        ], $recipients);
    }

    public static function pushToAllUsers($title, $content) {
        $notif = new Notifications();
        $userModel = new ManageUsers();
        $users = $userModel->getAllUsers();

        $recipients = [];

        foreach ($users as $user) {
            $recipients[] = ['user_id' =>(int) $user['user_id']];
        }

        $notif->create([
            'message_title' => $title,
            'content' => $content
        ], $recipients);
    }
}
?>