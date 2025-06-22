<?php

/**
 * Класс валидации
 */
class Validator
{
    /**
     * Валидация логина пользователя
     *
     * @param string $login Логин
     * @param JsonRepository $usersRepository Хранилище данных
     * @return bool
     */
    public static function validateLogin(string $login, JsonRepository $usersRepository): bool
    {
        if ($usersRepository->findByLogin($login)) {
            return false;
        }
        return true;
    }

    /**
     * Валидация номера телефона
     *
     * @param string $phoneNumber Номер телефона
     * @return bool
     */
    public static function validatePhone(string $phoneNumber): bool
    {
        return preg_match("~^(?:\+7|8)\d{10}$~", $phoneNumber);
    }

    /**
     * Валидация пароля
     *
     * @param string $password Пароль
     * @return string
     */
    public static function validatePassword(string $password): string
    {
        return preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/", $password);
    }

    /**
     * Валидация заявки
     *
     * @param array $newApplication Новая заявка
     * @param JsonRepository $usersRepository Хранилище данных
     * @return string
     */
    public static function validateApplication(array $newApplication, JsonRepository $usersRepository): string
    {
        if ($newApplication['actionType'] == "addApplication") {
            if ($usersRepository->findByLogin($newApplication['login'])) {
                $currentUser = $usersRepository->findByLogin($newApplication['login']);
                foreach ($currentUser['applications'] as $application) {
                    if (
                        $application['laptopModel'] == $newApplication['laptopModel'] &&
                        $application['serialNumber'] == $newApplication['serialNumber'] &&
                        $application['contactNumber'] == $newApplication['contactNumber'] &&
                        $application['issueType'] == $newApplication['issueType']
                    ) {
                        $id = $application['id'];
                        return $id;
                    }
                }
            }
        } elseif ($newApplication['actionType'] == "editApplication") {
            if ($usersRepository->findByLogin($newApplication['login'])) {
                $currentUser = $usersRepository->findByLogin($newApplication['login']);
                foreach ($currentUser['applications'] as $application) {
                    if (
                        $application['laptopModel'] == $newApplication['laptopModel'] &&
                        $application['serialNumber'] == $newApplication['serialNumber'] &&
                        $application['contactNumber'] == $newApplication['contactNumber'] &&
                        $application['issueType'] == $newApplication['issueType'] &&
                        $application['id'] != $newApplication['id']
                    ) {
                        $id = $application['id'];
                        return $id;
                    }
                }
            }
        }
        return 0;
    }

    /**
     * Валидация всех полей
     *
     * @param array $data Данные пользователя
     * @param JsonRepository $usersRepository Хранилище данных
     * @return array
     */
    public static function validateAll(array $data, JsonRepository $usersRepository): array
    {
        $errors = [];
        if ($data['login']) {
            if (!self::validateLogin($data['login'], $usersRepository)) {
                $id = $usersRepository->findByLogin($data['login'])['id'];
                $errors['login'] = 'Пользователь с таким логином уже существует. ID ' . $id;
            }
        }
        if ($data['contactNumber']) {
            if (!self::validatePhone($data['contactNumber'])) {
                $errors['contactNumber'] = 'Номер телефона должен быть в формате +7(XXX)XXX-XX-XX';
            }
        }
        if ($data['password']) {
            if (!self::validatePassword($data['password'])) {
                $errors['password'] = '
                Пароль должен содержать минимум 6 символов, включая цифры, заглавные и строчные буквы';
            }
        }
        return $errors;
    }
}