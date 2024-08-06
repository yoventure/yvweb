# utils.py

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
import requests

def get_chrome_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    service = Service(config.CHROMEDRIVER_PATH)
    return webdriver.Chrome(service=service, options=chrome_options)

def get_firefox_driver():
    firefox_options = FirefoxOptions()
    firefox_options.add_argument("--headless")
    service = FirefoxService(config.GECKODRIVER_PATH)
    return webdriver.Firefox(service=service, options=firefox_options)

def post_login_request(username, password):
    response = requests.post(f'{config.BASE_URL}/login', data={'username': username, 'password': password})
    return response

def test_https_encryption():
    response = post_login_request(config.VALID_USERNAME, config.VALID_PASSWORD)
    assert response.url.startswith('https://')

def test_sql_injection_protection():
    response = post_login_request("invalid' OR 1=1 --", 'password')
    assert response.status_code == 401
    assert '用户名或密码错误' in response.text
