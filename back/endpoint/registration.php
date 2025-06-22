<?php

header("Content-Type: application/json");
require_once '../engine/JsonRepository.php';
require_once '../engine/Validator.php';

// Получение данных
$data = json_decode(file_get_contents("php://input"), true);
$userRepository = new JsonRepository("../database/users.json");

// Валидация данных
$errors = [];
if (!(Validator::validateLogin($data['login'], $userRepository))) {
    $id = $userRepository->findByLogin($data['login'])['id'];
    $errors['login'] = 'Пользователь с таким логином уже существует. ID ' . $id;
}
if (!(Validator::validatePassword($data['password']))) {
    $errors['password'] = 'Пароль должен содержать минимум 6 символов, включая цифры, заглавные и строчные буквы';
}
if (!(empty($errors))) {
    echo json_encode(["success" => false, "errors" => $errors]);
    exit;
}

// Сохранение данных пользователя
$userData = [
    'login' => $data['login'],
    'password' => password_hash($data['password'], PASSWORD_DEFAULT),
];
$user = $userRepository->save($userData);

// Отправка ответа
echo json_encode(["success" => true, "message" => "Успешная регистрация"]);