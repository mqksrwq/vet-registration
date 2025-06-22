import {ApiClient} from "./ApiClient.js";

/**
 * Функция, редактирующая форму в зависимости от того, какой тип действия выбран пользователем.
 *
 * @listens {DOMContentLoaded}
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", function () {

    /**
     * Функция, отправляющая форму на сервер при нажатии на кнопку регистрации
     *
     * @Listens {click}
     * @param {MouseEvent} e
     * @returns {void}
     */
    document.getElementById("registration-button").addEventListener("click", async (e) => {
        e.preventDefault();

        if (!isFormFilled()) {
            document.getElementById("registration-error").textContent = "Все поля должны быть заполнены";
            return;
        }

        const USER_DATA = createUser();
        const API = new ApiClient("../../back/endpoint/registration.php");

        const RESULT = await API.post(USER_DATA);

        if (!RESULT.success) {
            showErrorMessages(RESULT);
            if (!document.getElementById("registration-error").textContent) {
                document.getElementById("registration-error").textContent = RESULT.message;
            }
        } else {
            window.location.href = "../../index.html";
        }
    });
});

/**
 * Функция, создающая пользователя на основе данных из формы.
 *
 * @returns {object} Объект с данными пользователя
 */
function createUser() {
    const USER_DATA = {
        login: document.getElementById("login").value,
        password: document.getElementById("password").value,
    };

    return USER_DATA;
}

/**
 * Функция, проверяющая, заполнены ли все поля формы регистрации.
 *
 * @returns {boolean} Возвращает true, если все поля заполнены, иначе false.
 */
function isFormFilled() {
    const SELECTORS = ["#login", "#password"];
    for (const SELECTOR of SELECTORS) {
        const FIELD = document.querySelector(SELECTOR);
        if (FIELD.required && !FIELD.value.trim()) {
            return false;
        }
    }
    return true;
}

/**
 * Функция отображения сообщений об ошибках ввода данных.
 *
 * @param {Object} result Объект с результатом валидации данных.
 * @returns {void}
 */
function showErrorMessages(result) {
    clearErrors();
    if (result.errors) {
        for (const [FIELD, MESSAGE] of Object.entries(result.errors)) {
            const ERROR_CONTAINER = document.getElementById(`${FIELD}-error`);
            if (ERROR_CONTAINER) ERROR_CONTAINER.textContent = MESSAGE;
        }
    }
}

/**
 * Функция, очищающая текст ошибок
 * @returns {void}
 */
function clearErrors() {
    const ERROR_SELECTORS = ["login-error", "password-error", "registration-error"];
    for (const SELECTOR of ERROR_SELECTORS) {
        const ERROR_CONTAINER = document.getElementById(SELECTOR);
        ERROR_CONTAINER.textContent = "";
    }
}

/**
 *  Функция, обрабатывающая нажатие кнопки "показать пароль" при вводе
 *
 *  @returns {void}
 */
document.querySelector('.toggle-password').addEventListener('click', function () {
    const PASSWORD_INPUT = document.getElementById('password');
    const EYE_ICON = this.querySelector('.eye-icon');

    if (PASSWORD_INPUT.type === 'password') {
        PASSWORD_INPUT.type = 'text';
        EYE_ICON.textContent = '🙈';
    } else {
        PASSWORD_INPUT.type = 'password';
        EYE_ICON.textContent = '👁️';
    }
});

/**
 * Функция, обработчик события, при котором происходит переход на страницу входа
 *
 * @returns {void}
 */
document.getElementById("login-button").addEventListener("click", function () {
    window.location.href = "../../index.html";
});