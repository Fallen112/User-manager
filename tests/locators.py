from selenium.webdriver.common.by import By


class MainPageLocators:
    # Форма создания
    NAME_INPUT = (By.ID, "name")
    EMAIL_INPUT = (By.ID, "email")
    AGE_INPUT = (By.ID, "age")
    SUBMIT_BTN = (By.CSS_SELECTOR, "button[type='submit']")

    # Список пользователей
    USER_CARDS = (By.CLASS_NAME, "user-card")
    USER_NAME = (By.CLASS_NAME, "name")
    USER_EMAIL = (By.CLASS_NAME, "email")
    USER_AGE = (By.CLASS_NAME, "age")

    # Кнопки действий
    EDIT_BTN = (By.CSS_SELECTOR, ".edit-btn")
    DELETE_BTN = (By.CSS_SELECTOR, ".delete-btn")