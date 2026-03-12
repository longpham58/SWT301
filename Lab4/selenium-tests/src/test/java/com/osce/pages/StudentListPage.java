package com.osce.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object – Trang Danh sách sinh viên.
 */
public class StudentListPage extends BasePage {

    private static final By PAGE = By.cssSelector(".student-list-page");
    private static final By TABLE = By.cssSelector(".student-table");
    private static final By TABLE_WRAP = By.cssSelector(".student-table-wrap");
    private static final By SEARCH = By.cssSelector(".student-search");
    private static final By SEARCH_SELECT = By.cssSelector(".student-search select");
    private static final By SEARCH_INPUT = By.cssSelector(".student-search input[type='text']");
    private static final By IMPORT_BUTTON = By.cssSelector(".student-header .btn.primary, .header-actions button.btn.primary");
    private static final By FILE_INPUT = By.cssSelector(".student-list-page input[type='file']");
    private static final By TOAST = By.cssSelector(".toast-notice");

    public StudentListPage(WebDriver driver, String baseUrl) {
        super(driver, baseUrl);
    }

    public void open() {
        navigateTo("/dashboard/students");
    }

    public void waitForPage() {
        waitVisible(PAGE);
    }

    public boolean isTableDisplayed() {
        return findElement(TABLE).isDisplayed();
    }

    public String getTableWrapText() {
        return findElement(TABLE_WRAP).getText();
    }

    public int getFilterSelectsCount() {
        return findElements(SEARCH_SELECT).size();
    }

    public int getFilterInputsCount() {
        return findElements(SEARCH_INPUT).size();
    }

    /** Bấm nút Import Excel (mở hộp chọn file). */
    public void clickImportExcel() {
        waitClickable(IMPORT_BUTTON).click();
    }

    /** Gửi đường dẫn file vào input file (sau khi đã click Import). */
    public void sendFileToInput(String absolutePath) {
        WebElement input = findElement(FILE_INPUT);
        input.sendKeys(absolutePath);
    }

    /** Đợi toast xuất hiện và lấy nội dung. */
    public String waitAndGetToastText() {
        return waitVisible(TOAST).getText();
    }
}
