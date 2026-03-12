package com.osce.base;

import com.osce.pages.LoginPage;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import java.time.Duration;

/**
 * Lớp cơ sở cho toàn bộ test – quản lý WebDriver, baseUrl và đăng nhập dùng chung.
 */
public abstract class BaseTest {

    private static WebDriver driver;
    private static String baseUrl;

    protected static final String TEST_USERNAME =
            System.getenv().getOrDefault("OSCE_TEST_USERNAME", "admin");
    protected static final String TEST_PASSWORD =
            System.getenv().getOrDefault("OSCE_TEST_PASSWORD", "admin123");

    @BeforeClass
    public static void setupClass() {
        baseUrl = System.getenv().getOrDefault("OSCE_BASE_URL", "http://localhost:5173");
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.manage().window().maximize();
    }

    @AfterClass
    public static void tearDownClass() {
        if (driver != null) {
            driver.quit();
            driver = null;
        }
    }

    /** Trả về driver dùng chung (các test class kế thừa dùng để tạo Page Object). */
    protected static WebDriver getDriver() {
        return driver;
    }

    /** Trả về base URL ứng dụng. */
    protected static String getBaseUrl() {
        return baseUrl;
    }

    /** Đăng nhập với user/pass và chờ chuyển sang /dashboard. Nếu đã trên /dashboard (session còn) thì bỏ qua. */
    protected void login(String username, String password) {
        LoginPage loginPage = new LoginPage(driver, baseUrl);
        loginPage.open();
        if (driver.getCurrentUrl().contains("/dashboard")) return;
        loginPage.enterUsername(username);
        loginPage.enterPassword(password);
        loginPage.submit();
        loginPage.waitForRedirectToDashboard();
    }

    @After
    public void pauseAfterTest() throws InterruptedException {
        Thread.sleep(3000);
    }
}
