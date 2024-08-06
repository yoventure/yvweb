# utils.py
import mysql.connector
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def connect_to_database(config):
    return mysql.connector.connect(**config)

def init_driver(browser="chrome"):
    if browser == "chrome":
        driver = webdriver.Chrome()
    elif browser == "firefox":
        driver = webdriver.Firefox()
    elif browser == "safari":
        driver = webdriver.Safari()
    else:
        raise ValueError("Unsupported browser!")
    return driver

def register_user(driver, url, username, password, email):
    driver.get(url)
    driver.find_element(By.NAME, "username").send_keys(username)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "submit").click()

def wait_for_success_message(driver):
    return WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "success-message"))
    )
