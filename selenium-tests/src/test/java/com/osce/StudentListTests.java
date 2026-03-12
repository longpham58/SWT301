package com.osce;

import com.osce.base.BaseTest;
import com.osce.pages.StudentListPage;
import org.junit.Before;
import org.junit.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.Assert.assertTrue;

/**
 * Kiểm thử Selenium – Feature: Danh sách sinh viên (Page Object Model).
 */
public class StudentListTests extends BaseTest {

    private static final String MSG_KHONG_TIM_THAY_SINH_VIEN = "Không tìm thấy sinh viên";

    private StudentListPage studentListPage;

    @Before
    public void openFeature() {
        login(TEST_USERNAME, TEST_PASSWORD);
        studentListPage = new StudentListPage(getDriver(), getBaseUrl());
        studentListPage.open();
    }

    @Test
    public void TC_STUDENT_001_pageLoadsShowsTableOrEmptyMessage() {
        studentListPage.waitForPage();
        assertTrue(studentListPage.isTableDisplayed());
        String wrapText = studentListPage.getTableWrapText();
        assertTrue(wrapText.contains(MSG_KHONG_TIM_THAY_SINH_VIEN)
                || wrapText.contains("MSSV")
                || wrapText.contains("Lớp"));
    }

    @Test
    public void TC_STUDENT_002_invalidFileShowsError() throws Exception {
        studentListPage.waitForPage();
        Path invalidFile = Files.createTempFile("invalid", ".txt");
        try {
            Files.writeString(invalidFile, "not excel content");
            studentListPage.sendFileToInput(invalidFile.toAbsolutePath().toString());
            String toast = studentListPage.waitAndGetToastText();
            assertTrue("Toast should mention invalid or import fail: " + toast,
                    toast.contains("Invalid") || toast.contains("Import thất bại") || toast.contains("Import failed") || toast.contains("thất bại"));
        } finally {
            Files.deleteIfExists(invalidFile);
        }
    }

    @Test
    public void TC_STUDENT_003_filterControlsPresent() {
        studentListPage.waitForPage();
        int selects = studentListPage.getFilterSelectsCount();
        int inputs = studentListPage.getFilterInputsCount();
        assertTrue(selects >= 1 || inputs >= 1);
    }
}
