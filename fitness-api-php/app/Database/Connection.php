<?php
  namespace App\Database;
  use mysqli;
  class Connection{
    private $connection;
    private static $instance = null;
    private function __construct(){
      $config = require __DIR__."/../../config/config.php";
      $this->connection = new mysqli($config['db_host'],$config['dn_user'],$config['db_pass'],$config['dn_name']);
      if($this->connection->connect_error){
        die("DataBase connection faield: " .$this->connection->connect_error);
      }
    }
    public static function getInstance(): mysqli{
      if(self::$instance === null){
        self::$instance = new self();
      }
      return self::$instance->connection;
    }
  }
?>