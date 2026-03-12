package com.osce;

import com.osce.base.BaseTest;
import com.osce.pages.SetupExamPage;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Kiểm thử Selenium – Feature: Thiết lập kỳ thi (Page Object Model).
 */
public class SetupExamTests extends BaseTest {

    private static final String MSG_VUI_LONG_DIEN_DU = "Vui lòng điền đủ các thông tin sau:";
    private static final String MSG_THOI_GIAN_THI = "Thời gian thi";

    private SetupExamPage setupExamPage;

    @Before
    public void openFeature() {
        login(TEST_USERNAME, TEST_PASSWORD);
        setupExamPage = new SetupExamPage(getDriver(), getBaseUrl());
        setupExamPage.open();
    }

    @Test
    public void TC_SETUP_001_validationMessageWhenSaveEmptyForm() {
        setupExamPage.waitForPage();
        setupExamPage.clickSave();
        assertTrue(setupExamPage.getValidationMessageText().contains(MSG_VUI_LONG_DIEN_DU));
    }

    @Test
    public void TC_SETUP_002_examCodeDropdownPresent() {
        setupExamPage.waitForPage();
        int totalOptions = setupExamPage.getExamCodeOptionsCount();
        int withValue = setupExamPage.getExamCodeOptionsWithValueCount();
        assertTrue(totalOptions >= 2 && withValue >= 1);
    }

    @Test
    public void TC_SETUP_003_validationWhenExaminationTimeZero() {
        setupExamPage.waitForPage();
        setupExamPage.selectFirstExamCode();
        setupExamPage.setExaminationTime(0);
        setupExamPage.clickSave();
        String validation = setupExamPage.getValidationMessageText();
        assertTrue("Validation should mention examination time: " + validation,
                validation.contains(MSG_THOI_GIAN_THI) || validation.contains("phải lớn hơn 0"));
    }
}
