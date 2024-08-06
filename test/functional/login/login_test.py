import pytest
from selenium.webdriver.common.by import By
from config import *
from utils import get_chrome_driver, get_firefox_driver, post_login_request

@pytest.fixture(scope="module")
def browser():
    driver = get_chrome_driver()
    yield driver
    driver.quit()

def test_empty_username(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys('')
    browser.find_element(By.NAME, 'password').send_keys(VALID_PASSWORD)
    browser.find_element(By.NAME, 'submit').click()
    assert '用户名不能为空' in browser.page_source

def test_empty_password(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys(VALID_USERNAME)
    browser.find_element(By.NAME, 'password').send_keys('')
    browser.find_element(By.NAME, 'submit').click()
    assert '密码不能为空' in browser.page_source

def test_invalid_username_format(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys('invalidemail')
    browser.find_element(By.NAME, 'password').send_keys(VALID_PASSWORD)
    browser.find_element(By.NAME, 'submit').click()
    assert '用户名格式不正确' in browser.page_source

def test_invalid_password_format(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys(VALID_USERNAME)
    browser.find_element(By.NAME, 'password').send_keys('short')
    browser.find_element(By.NAME, 'submit').click()
    assert '密码强度不足' in browser.page_source

def test_successful_login(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys(VALID_USERNAME)
    browser.find_element(By.NAME, 'password').send_keys(VALID_PASSWORD)
    browser.find_element(By.NAME, 'submit').click()
    assert '登录成功' in browser.page_source

def test_failed_login(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys(VALID_USERNAME)
    browser.find_element(By.NAME, 'password').send_keys(INVALID_PASSWORD)
    browser.find_element(By.NAME, 'submit').click()
    assert '用户名或密码错误' in browser.page_source

def test_brute_force_protection():
    for _ in range(6):
        response = post_login_request(VALID_USERNAME, INVALID_PASSWORD)
        if response.status_code == 401:
            continue
    assert response.status_code == 403
    assert '账户已锁定' in response.text

def test_error_message_clarity(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys(VALID_USERNAME)
    browser.find_element(By.NAME, 'password').send_keys(INVALID_PASSWORD)
    browser.find_element(By.NAME, 'submit').click()
    assert '用户名或密码错误' in browser.page_source

def test_remember_me_functionality(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys(VALID_USERNAME)
    browser.find_element(By.NAME, 'password').send_keys(VALID_PASSWORD)
    browser.find_element(By.NAME, 'remember_me').click()
    browser.find_element(By.NAME, 'submit').click()
    browser.get(f'{BASE_URL}/dashboard')
    assert 'Dashboard' in browser.page_source

def test_login_response_time():
    import time
    start_time = time.time()
    response = post_login_request(VALID_USERNAME, VALID_PASSWORD)
    response_time = time.time() - start_time
    assert response_time < 2

@pytest.mark.parametrize("browser_name", ["chrome", "firefox"])
def test_cross_browser_login(browser_name):
    if browser_name == "chrome":
        driver = get_chrome_driver()
    elif browser_name == "firefox":
        driver = get_firefox_driver()
    driver.get(f'{BASE_URL}/login')
    driver.find_element(By.NAME, 'username').send_keys(VALID_USERNAME)
    driver.find_element(By.NAME, 'password').send_keys(VALID_PASSWORD)
    driver.find_element(By.NAME, 'submit').click()
    assert 'Dashboard' in driver.page_source
    driver.quit()

def test_long_username(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys(LONG_USERNAME)
    browser.find_element(By.NAME, 'password').send_keys(VALID_PASSWORD)
    browser.find_element(By.NAME, 'submit').click()
    assert '用户名长度超出限制' in browser.page_source

def test_special_characters_in_password(browser):
    browser.get(f'{BASE_URL}/login')
    browser.find_element(By.NAME, 'username').send_keys(VALID_USERNAME)
    browser.find_element(By.NAME, 'password').send_keys(SPECIAL_CHAR_PASSWORD)
    browser.find_element(By.NAME, 'submit').click()
    assert '登录成功' in browser.page_source

def test_server_error_handling():
    import requests
    from requests.exceptions import RequestException

    try:
        response = post_login_request(VALID_USERNAME, VALID_PASSWORD)
    except RequestException:
        assert True  # Handle network errors
    else:
        assert response.status_code == 500  # Handle server errors

if __name__ == '__main__':
    pytest.main(["--html=report.html", "--self-contained-html"])
