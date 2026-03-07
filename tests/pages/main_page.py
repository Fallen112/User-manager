from pages.base_page import BasePage
from locators import MainPageLocators


class MainPage(BasePage):
    def open(self, url):
        self.driver.get(url)

    def create_user(self, name, email, age):
        self.type_text(MainPageLocators.NAME_INPUT, name)
        self.type_text(MainPageLocators.EMAIL_INPUT, email)
        self.type_text(MainPageLocators.AGE_INPUT, str(age))
        self.click(MainPageLocators.SUBMIT_BTN)

    def get_users_count(self):
        return len(self.find_elements(MainPageLocators.USER_CARDS))

    def get_first_user_name(self):
        users = self.find_elements(MainPageLocators.USER_CARDS)
        if users:
            return users[0].find_element(*MainPageLocators.USER_NAME).text
        return None