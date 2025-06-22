import {ApiClient} from "./ApiClient.js";

/**
 * Функция, редактирующая форму в зависимости от того, какой тип действия выбран пользователем.
 *
 * @listens {DOMContentLoaded}
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", function () {
    const ACTION_TYPE = localStorage.getItem("actionType");
    if (ACTION_TYPE === "addApplication") changeToApplication();
    if (ACTION_TYPE === "editApplication") changeToEdit();
    if (ACTION_TYPE === "editApplication") {
        const APPLICATION_ID = localStorage.getItem("applicationId");
        fillForm(APPLICATION_ID);
    }
    let selectors = ["#laptop-model", "#serial-number", "#contact-number"];

    document.getElementById("registration-button").addEventListener("click", async (e) => {
        e.preventDefault();

        if (!isFormFilled()) {
            document.getElementById("registration-error").textContent = "Все поля должны быть заполнены";
            return;
        }

        const USER_DATA = createUser();
        const API = new ApiClient();

        switch (ACTION_TYPE) {
            case "addApplication":
                USER_DATA.login = JSON.parse(localStorage.getItem("currentUser")).login;
                API.apiUrl = "../../back/endpoint/addApplication.php";
                USER_DATA.actionType = ACTION_TYPE;
                break;
            case "editApplication":
                USER_DATA.login = JSON.parse(localStorage.getItem("currentUser")).login;
                API.apiUrl = "../../back/endpoint/editApplication.php";
                USER_DATA.id = localStorage.getItem("applicationId");
                USER_DATA.actionType = ACTION_TYPE;
                break;
        }

        const RESULT = await API.post(USER_DATA);

        if (!RESULT.success) {
            showErrorMessages(RESULT);
            if (!document.getElementById("registration-error").textContent) {
                document.getElementById("registration-error").textContent = RESULT.message;
            }
        } else {
            window.location.href = "cabinet.html";
        }
    })
});

/**
 * Функция, создающая пользователя на основе данных из формы.
 *
 * @returns {object} Объект с данными пользователя
 */
function createUser() {
    const USER_DATA = {
        laptopModel: document.getElementById("laptop-model").value,
        serialNumber: document.getElementById("serial-number").value,
        login: "",
        contactNumber: document.getElementById("contact-number").value,
        issueType: document.getElementById("issue-type").value
    };

    return USER_DATA;
}

/**
 * Функция, меняющая страницу для отправления новой заявки
 *
 * @returns {void}
 */
function changeToApplication() {
    const FORM_TITLE = document.getElementById("form-title");
    FORM_TITLE.textContent = "Заявка на оформление заказа";

    const REGISTRATION_BUTTON = document.getElementById("registration-button");
    REGISTRATION_BUTTON.textContent = "Отправить заявку";

    addExitButton();
}

/**
 * Функция, меняющая страницу для редактирования заявки
 *
 * @returns {void}
 */
function changeToEdit() {
    const FORM_TITLE = document.getElementById("form-title");
    FORM_TITLE.textContent = "Редактирование заявки";

    const REGISTRATION_BUTTON = document.getElementById("registration-button");
    REGISTRATION_BUTTON.textContent = "Изменить заявку";

    addExitButton();
}

/**
 * Функция, добавляющая кнопку выхода из формы регистрации
 *
 * @returns {void}
 */
function addExitButton() {
    const EXIT_BUTTON = document.createElement('button');
    EXIT_BUTTON.id = "exit-button";
    EXIT_BUTTON.textContent = "Назад";
    const CONTAINER = document.querySelector(".container");
    CONTAINER.append(EXIT_BUTTON);

    exitButtonListener(EXIT_BUTTON);
}

/**
 * Функция, обрабатывающая событие нажатия на кнопку выхода из формы регистрации.
 *
 * @param {HTMLElement} exitButton Кнопка выхода из формы регистрации.
 * @returns {void}
 */
function exitButtonListener(exitButton) {
    exitButton.addEventListener("click", function () {
        window.location.href = "cabinet.html";
    });
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
    const ERROR_SELECTORS = ["contactNumber-error", "registration-error"];
    for (const SELECTOR of ERROR_SELECTORS) {
        const ERROR_CONTAINER = document.getElementById(SELECTOR);
        ERROR_CONTAINER.textContent = "";
    }
}

/**
 * Функция, заполняющая форму данными заявки при её редактировании.
 *
 * @param {number} applicationId Идентификатор заявки.
 * @returns {void}
 */
async function fillForm(applicationId) {
    const API = new ApiClient("../../back/endpoint/getApplication.php");
    const RESULT = await API.post(applicationId);

    const APPLICATION = RESULT.application;

    document.getElementById("laptop-model").value = APPLICATION.laptopModel;
    document.getElementById("serial-number").value = APPLICATION.serialNumber;
    document.getElementById("contact-number").value = APPLICATION.contactNumber;
    document.getElementById("issue-type").value = APPLICATION.issueType;
}

/**
 * Функция, проверяющая, заполнены ли все поля формы регистрации.
 *
 * @returns {boolean} Возвращает true, если все поля заполнены, иначе false.
 */
function isFormFilled() {
    const SELECTORS = ["#laptop-model", "#serial-number", "#contact-number"];
    for (const SELECTOR of SELECTORS) {
        const FIELD = document.querySelector(SELECTOR);
        if (FIELD.required && !FIELD.value.trim()) {
            return false;
        }
    }
    return true;
}