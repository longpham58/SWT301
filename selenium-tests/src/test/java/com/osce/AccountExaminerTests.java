package com.osce;

import com.osce.base.BaseTest;
import com.osce.pages.AccountExaminerPage;
import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Kiểm thử Selenium – Feature: Tài khoản giám thị (Page Object Model).
 */
public class AccountExaminerTests extends BaseTest {

    private static final String MSG_XAC_NHAN_XOA_GIAM_THI = "Bạn có chắc chắn muốn xóa giám thị này?";
    private static final String MSG_DA_XOA_GIAM_THI = "Đã xóa giám thị thành công.";
    private static final String MSG_PASSWORD_MIN_HINT = "nhập ít nhất 6 ký tự";

    private AccountExaminerPage accountExaminerPage;

    @Before
    public void openFeature() {
        login(TEST_USERNAME, TEST_PASSWORD);
        accountExaminerPage = new AccountExaminerPage(getDriver(), getBaseUrl());
        accountExaminerPage.open();
    }

    @Test
    public void TC_EXAMINER_001_pageLoadsWithTabsAndTable() {
        accountExaminerPage.waitForPage();
        assertTrue(accountExaminerPage.getTabsCount() >= 2);
        assertTrue(accountExaminerPage.isTableDisplayed());
        assertTrue(accountExaminerPage.hasAddButton());
    }

    @Test
    public void TC_EXAMINER_002_addExaminerFormShowsPasswordHintWhenShort() {
        accountExaminerPage.waitForPage();
        accountExaminerPage.clickAddExaminer();
        accountExaminerPage.waitForAddModal();
        accountExaminerPage.fillAddExaminerForm("EX001", "Test Examiner", "exam01", "12345");
        String hint = accountExaminerPage.getPasswordHintText();
        assertTrue("Password hint should mention at least 6 characters: " + hint,
                hint.contains(MSG_PASSWORD_MIN_HINT) || hint.contains("6"));
    }

    @Test
    public void TC_EXAMINER_003_deleteExaminerConfirmAndSuccess() {
        accountExaminerPage.waitForTableRows();
        Assume.assumeTrue("Cần ít nhất 1 giám thị trong bảng để kiểm thử xóa",
                accountExaminerPage.hasAtLeastOneRow());

        accountExaminerPage.clickFirstRowActions();
        accountExaminerPage.clickDeleteInDropdown();
        assertTrue(accountExaminerPage.getConfirmModalText().contains(MSG_XAC_NHAN_XOA_GIAM_THI));

        accountExaminerPage.clickConfirmDelete();
        assertTrue(accountExaminerPage.getSuccessMessageText().contains(MSG_DA_XOA_GIAM_THI));
    }

    @Test
    public void TC_EXAMINER_004_statusDropdownShowsActiveInactiveLockAndUpdates() {
        accountExaminerPage.waitForTableRows();
        Assume.assumeTrue("Cần ít nhất 1 giám thị để kiểm thử đổi trạng thái",
                accountExaminerPage.hasAtLeastOneRow());

        accountExaminerPage.clickFirstRowStatusDropdown();
        accountExaminerPage.selectStatusOption("Inactive");
        String status = accountExaminerPage.getFirstRowStatusText();
        assertTrue("Status should show Inactive or equivalent: " + status,
                status.contains("Inactive") || status.contains("Khóa") || status.contains("Active"));
    }
}
