<?php

header("Content-Type: application/json");
require_once '../engine/JsonRepository.php';

function checkPassword($password, $hash)
{
    return password_verify($password, $hash);
}

// Получение данных
$data = json_decode(file_get_contents("php://input"), true);
$usersRepository = new JsonRepository("../database/users.json");

// Авторизация пользователя и отправка ответа
$user = $usersRepository->findByLogin($data['login']);
if ($user && (checkPassword($data['password'], $user['password']))) {
    $updatedUser = $usersRepository->update($user['id'], [
        'visits' => $user['visits'] + 1,
    ]);

    echo json_encode([
        "success" => true,
        "user" => [
            'id' => $user['id'],
            'login' => $user['login'],
            'visits' => $updatedUser['visits'],
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Неверный логин или пароль"]);
}