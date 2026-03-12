package com.osce.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

/**
 * Lớp cơ sở cho mọi Page Object – chứa driver, baseUrl và các thao tác chung.
 */
public abstract class BasePage {

    protected final WebDriver driver;
    protected final String baseUrl;
    protected final WebDriverWait wait;

    protected static final int DEFAULT_WAIT_SECONDS = 10;

    public BasePage(WebDriver driver, String baseUrl) {
        this.driver = driver;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(DEFAULT_WAIT_SECONDS));
    }

    public WebDriver getDriver() {
        return driver;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public WebDriverWait getWait() {
        return wait;
    }

    /** Điều hướng tới path (path bắt đầu bằng /, ví dụ /login). */
    public void navigateTo(String path) {
        driver.get(baseUrl + path);
    }

    /** Đợi element visible theo By (dùng trong subclass). */
    protected WebElement waitVisible(org.openqa.selenium.By by) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(by));
    }

    /** Đợi element clickable. */
    protected WebElement waitClickable(org.openqa.selenium.By by) {
        return wait.until(ExpectedConditions.elementToBeClickable(by));
    }

    /** Đợi URL chứa đoạn text. */
    protected void waitUrlContains(String fragment) {
        wait.until(ExpectedConditions.urlContains(fragment));
    }

    /** Lấy danh sách elements (dùng trong subclass). */
    protected List<WebElement> findElements(org.openqa.selenium.By by) {
        return driver.findElements(by);
    }

    /** Tìm một element (dùng trong subclass). */
    protected WebElement findElement(org.openqa.selenium.By by) {
        return driver.findElement(by);
    }
}
