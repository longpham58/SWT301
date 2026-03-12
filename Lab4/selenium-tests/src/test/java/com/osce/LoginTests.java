package com.osce;

import com.osce.base.BaseTest;
import com.osce.pages.LoginPage;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Kiểm thử Selenium – Feature: Đăng nhập (Page Object Model).
 */
public class LoginTests extends BaseTest {

    private static final String MSG_THIEU_USERNAME_PASSWORD = "Thiếu username hoặc password";
    private static final String MSG_USERNAME_PASSWORD_SAI = "Username hoặc mật khẩu không đúng";

    private LoginPage loginPage;

    @Before
    public void openLoginPage() throws InterruptedException {
        loginPage = new LoginPage(getDriver(), getBaseUrl());
        loginPage.open();
        Thread.sleep(800);
    }

    @Test
    public void TC_LOGIN_001_validLoginRedirectsToDashboard() {
        login(TEST_USERNAME, TEST_PASSWORD);
        assertTrue(getDriver().getCurrentUrl().contains("/dashboard"));
        assertFalse(loginPage.hasFormError());
    }

    @Test
    public void TC_LOGIN_002_emptyCredentialsShowsError() {
        loginPage.submit();
        String text = loginPage.waitAndGetFormErrorText();
        assertTrue(text.contains(MSG_THIEU_USERNAME_PASSWORD)
                || text.toLowerCase().contains("username")
                || text.toLowerCase().contains("password"));
    }

    @Test
    public void TC_LOGIN_003_invalidCredentialsShowsError() {
        loginPage.enterUsername("wronguser");
        loginPage.enterPassword("wrongpass");
        loginPage.submit();
        String errText = loginPage.waitAndGetFormErrorText();
        assertTrue(errText.contains(MSG_USERNAME_PASSWORD_SAI)
                || errText.contains("không đúng")
                || errText.contains("Chưa cấu hình"));
    }

    @Test
    public void TC_LOGIN_004_unauthenticatedRedirectsToLogin() {
        getDriver().manage().deleteAllCookies();
        getDriver().get(getBaseUrl() + "/dashboard");
        new LoginPage(getDriver(), getBaseUrl()).waitForLoginUrl();
        assertTrue(getDriver().getCurrentUrl().contains("/login"));
    }
}
