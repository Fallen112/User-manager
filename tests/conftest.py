### 🔧 **Файл `tests/conftest.py`**
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope="function")
def browser():
    """Фикстура для браузера"""
    options = Options()
    options.add_argument("--headless=new")  # можно убрать, если нужно видеть
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    yield driver
    driver.quit()

@pytest.fixture(scope="function")
def base_url():
    """Базовый URL фронтенда"""
    return "http://localhost:8080"