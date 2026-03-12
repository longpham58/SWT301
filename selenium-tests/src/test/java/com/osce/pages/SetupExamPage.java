package com.osce.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import java.util.List;

/**
 * Page Object – Trang Thiết lập kỳ thi.
 */
public class SetupExamPage extends BasePage {

    private static final By PAGE = By.cssSelector(".setup-exam-page");
    private static final By SAVE_BTN = By.cssSelector(".setup-actions button.btn-primary");
    private static final By VALIDATION_MESSAGE = By.cssSelector(".setup-validation-message[role='alert']");
    private static final By EXAM_CODE_SELECT = By.cssSelector("select.exam-code-select");
    private static final By OPTION = By.tagName("option");
    private static final By TIME_EXAM_GRID = By.cssSelector(".time-exam-grid");

    public SetupExamPage(WebDriver driver, String baseUrl) {
        super(driver, baseUrl);
    }

    public void open() {
        navigateTo("/dashboard/setup-exam");
    }

    public void waitForPage() {
        waitVisible(PAGE);
    }

    public void clickSave() {
        waitClickable(SAVE_BTN).click();
    }

    /** Lấy nội dung thông báo validation (sau khi bấm Lưu form trống). */
    public String getValidationMessageText() {
        return waitVisible(VALIDATION_MESSAGE).getText();
    }

    /** Số option trong dropdown mã kỳ thi (có value). */
    public int getExamCodeOptionsWithValueCount() {
        WebElement selectEl = waitVisible(EXAM_CODE_SELECT);
        List<WebElement> options = selectEl.findElements(OPTION);
        int count = 0;
        for (WebElement o : options) {
            String v = o.getAttribute("value");
            if (v != null && !v.isEmpty()) count++;
        }
        return count;
    }

    /** Tổng số option trong dropdown mã kỳ thi. */
    public int getExamCodeOptionsCount() {
        return waitVisible(EXAM_CODE_SELECT).findElements(OPTION).size();
    }

    /** Chọn option đầu tiên có value (mã kỳ thi). */
    public void selectFirstExamCode() {
        WebElement selectEl = waitVisible(EXAM_CODE_SELECT);
        Select select = new Select(selectEl);
        List<WebElement> options = select.getOptions();
        for (WebElement o : options) {
            String v = o.getAttribute("value");
            if (v != null && !v.isEmpty()) {
                select.selectByValue(v);
                return;
            }
        }
    }

    /** Đặt Thời gian thi (phút) = value (input thứ 2 trong .time-exam-grid). */
    public void setExaminationTime(int value) {
        WebElement grid = findElement(TIME_EXAM_GRID);
        List<WebElement> inputs = grid.findElements(By.cssSelector("input[type='number']"));
        if (inputs.size() >= 2) {
            WebElement examTimeInput = inputs.get(1);
            examTimeInput.clear();
            examTimeInput.sendKeys(String.valueOf(value));
        }
    }
}
