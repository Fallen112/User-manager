import pytest
from pages.main_page import MainPage


class TestUsers:

    def test_create_user(self, browser, base_url):
        page = MainPage(browser)
        page.open(base_url)

        initial_count = page.get_users_count()

        page.create_user("Test User", "test@example.com", 25)

        new_count = page.get_users_count()
        assert new_count == initial_count + 1

        user_name = page.get_first_user_name()
        assert "Test User" in user_name

    def test_create_user_invalid_email(self, browser, base_url):
        page = MainPage(browser)
        page.open(base_url)

        initial_count = page.get_users_count()
        page.create_user("Bad Email", "not-an-email", 30)

        new_count = page.get_users_count()
        assert new_count == initial_count  # пользователь не должен создаться