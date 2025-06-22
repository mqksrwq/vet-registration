<?php

header("Content-Type: application/json");
require_once '../engine/JsonRepository.php';
require_once '../engine/Validator.php';

// Получение данных из формы
$data = json_decode(file_get_contents("php://input"), true);
$usersRepository = new JsonRepository("../database/users.json");

// Валидация данных
$errors = [];
$flag = Validator::validatePhone($data['contactNumber']);
if ($flag == 0) {
    $errors['contactNumber'] = 'Номер телефона должен быть в формате +7(XXX)XXXXXXX';
}
$id = Validator::validateApplication($data, $usersRepository);
if ($id) {
    $errors['registration'] = 'Такая заявка уже существует. ID ' . $id;
}
unset($errors['login']);
if (!empty($errors)) {
    echo json_encode(["success" => false, "errors" => $errors]);
    exit;
}

// Создание заявки
$user = $usersRepository->findByLogin($data['login']);
$application = [
    'laptopModel' => $data['laptopModel'],
    'serialNumber' => $data['serialNumber'],
    'contactNumber' => $data['contactNumber'],
    'login' => $data['login'],
    'issueType' => $data['issueType']
];
$usersRepository->addApplication($user['id'], $application);

echo json_encode(["success" => true, "message" => "Заявка отправлена"]);