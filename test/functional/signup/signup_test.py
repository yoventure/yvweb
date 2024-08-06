import pytest
from utils import connect_to_database, init_driver, register_user, wait_for_success_message
from config import DB_CONFIG, APP_URL

# 表单验证测试用例
def test_form_validation():
    driver = init_driver()
    try:
        register_user(driver, APP_URL, "", "", "")
        assert "This field is required" in driver.page_source

        register_user(driver, APP_URL, "user", "pass", "invalid-email")
        assert "Enter a valid email address" in driver.page_source

        register_user(driver, APP_URL, "user", "short", "valid@example.com")
        assert "Password must be at least 8 characters long" in driver.page_source

        register_user(driver, APP_URL, "user", "ValidPassword123", "valid@example.com")
        success_message = wait_for_success_message(driver)
        assert success_message.text == "Registration successful"
    finally:
        driver.quit()

# 用户体验测试用例
def test_user_experience():
    driver = init_driver()
    try:
        register_user(driver, APP_URL, "validusername", "ValidPassword123", "valid@example.com")
        success_message = wait_for_success_message(driver)
        assert success_message.text == "Registration successful"

        layout_test = driver.find_element(By.ID, "form-layout")
        assert layout_test is not None

        loading_indicator = driver.find_element(By.ID, "loading-indicator")
        assert loading_indicator is not None
    finally:
        driver.quit()

# 安全性测试用例
def test_security():
    driver = init_driver()
    try:
        # SQL注入测试
        register_user(driver, APP_URL, "' OR 1=1 --", "password", "valid@example.com")
        assert "Invalid input" in driver.page_source

        # XSS攻击测试
        register_user(driver, APP_URL, "<script>alert('xss')</script>", "password", "valid@example.com")
        assert "<script>alert('xss')</script>" not in driver.page_source
    finally:
        driver.quit()

# 服务器端验证测试用例
def test_server_side_validation():
    conn = connect_to_database(DB_CONFIG)
    cursor = conn.cursor(dictionary=True)

    driver = init_driver()
    try:
        register_user(driver, APP_URL, "validusername", "ValidPassword123", "valid@example.com")
        success_message = wait_for_success_message(driver)
        assert success_message.text == "Registration successful"

        cursor.execute("SELECT * FROM users WHERE username='validusername'")
        user_data = cursor.fetchone()
        assert user_data is not None
        assert user_data["username"] == "validusername"
        assert user_data["email"] == "valid@example.com"
    finally:
        cursor.close()
        conn.close()
        driver.quit()

# 邮件验证测试用例
def test_email_verification():
    driver = init_driver()
    try:
        register_user(driver, APP_URL, "validusername", "ValidPassword123", "valid@example.com")
        success_message = wait_for_success_message(driver)
        assert success_message.text == "Registration successful"

        # 模拟点击验证邮件中的链接
        driver.get("http://your-app-url/verify-email?token=dummy_token")
        assert "Email verified successfully" in driver.page_source
    finally:
        driver.quit()

# 数据存储测试用例
def test_data_storage():
    conn = connect_to_database(DB_CONFIG)
    cursor = conn.cursor(dictionary=True)

    driver = init_driver()
    try:
        register_user(driver, APP_URL, "validusername", "ValidPassword123", "valid@example.com")
        success_message = wait_for_success_message(driver)
        assert success_message.text == "Registration successful"

        cursor.execute("SELECT * FROM users WHERE username='validusername'")
        user_data = cursor.fetchone()
        assert user_data is not None
        assert user_data["username"] == "validusername"
        assert user_data["email"] == "valid@example.com"
    finally:
        cursor.close()
        conn.close()
        driver.quit()

# 多设备兼容性测试用例
@pytest.mark.parametrize("browser", ["chrome", "firefox", "safari"])
def test_cross_browser(browser):
    driver = init_driver(browser)
    try:
        register_user(driver, APP_URL, "validusername", "ValidPassword123", "valid@example.com")
        success_message = wait_for_success_message(driver)
        assert success_message.text == "Registration successful"
    finally:
        driver.quit()

# 国际化测试用例
def test_internationalization():
    driver = init_driver()
    try:
        register_user(driver, APP_URL, "用户", "密码123", "valid@example.com")
        success_message = wait_for_success_message(driver)
        assert success_message.text == "Registration successful"

        driver.find_element(By.ID, "language-selector").click()
        driver.find_element(By.ID, "lang-zh").click()
        assert "注册成功" in driver.page_source
    finally:
        driver.quit()

if __name__ == "__main__":
    pytest.main()





