package com.osce.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

/**
 * Page Object – Trang Đăng nhập.
 */
public class LoginPage extends BasePage {

    private static final By USERNAME = By.id("username");
    private static final By PASSWORD = By.id("password");
    private static final By SUBMIT_BTN = By.cssSelector("form.login-form button[type='submit']");
    private static final By FORM_ERROR = By.cssSelector(".form-error");

    public LoginPage(WebDriver driver, String baseUrl) {
        super(driver, baseUrl);
    }

    /** Mở trang login và đợi form sẵn sàng. Nếu đã đăng nhập (redirect /dashboard) thì không chờ form. */
    public void open() {
        navigateTo("/login");
        WebDriverWait loginWait = new WebDriverWait(driver, Duration.ofSeconds(15));
        loginWait.until(d -> d.getCurrentUrl().contains("/login") || d.getCurrentUrl().contains("/dashboard"));
        if (driver.getCurrentUrl().contains("/dashboard")) return;
        loginWait.until(ExpectedConditions.visibilityOfElementLocated(USERNAME));
    }

    public void enterUsername(String username) {
        waitVisible(USERNAME).clear();
        findElement(USERNAME).sendKeys(username);
    }

    public void enterPassword(String password) {
        findElement(PASSWORD).clear();
        findElement(PASSWORD).sendKeys(password);
    }

    public void submit() {
        waitClickable(SUBMIT_BTN).click();
    }

    /** Đăng nhập một bước (mở trang, nhập user/pass, submit). */
    public void login(String username, String password) {
        open();
        enterUsername(username);
        enterPassword(password);
        submit();
    }

    /** Đợi chuyển sang /dashboard (sau khi login thành công). */
    public void waitForRedirectToDashboard() {
        waitUrlContains("/dashboard");
    }

    /** Đợi URL chứa /login (dùng khi kiểm tra redirect về trang đăng nhập). */
    public void waitForLoginUrl() {
        waitUrlContains("/login");
    }

    /** Có hiển thị thông báo lỗi form không. */
    public boolean hasFormError() {
        return !findElements(FORM_ERROR).isEmpty();
    }

    /** Lấy nội dung thông báo lỗi (nếu có). */
    public String getFormErrorText() {
        List<WebElement> errors = findElements(FORM_ERROR);
        return errors.isEmpty() ? "" : errors.get(0).getText();
    }

    /** Đợi và lấy text lỗi (sau khi submit). */
    public String waitAndGetFormErrorText() {
        return waitVisible(FORM_ERROR).getText();
    }
}
