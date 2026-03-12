package com.osce.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object – Trang Tài khoản giám thị.
 */
public class AccountExaminerPage extends BasePage {

    private static final By PAGE = By.cssSelector(".account-examiner-page");
    private static final By TABS = By.cssSelector(".account-tabs .account-tab");
    private static final By TABLE = By.cssSelector(".account-table");
    private static final By ADD_BUTTON = By.cssSelector(".btn-add-examiner");
    private static final By TABLE_ROW = By.cssSelector(".account-table tbody tr");
    private static final By ACTIONS_TRIGGER = By.cssSelector(".cell-dropdown-trigger.actions-trigger");
    private static final By DROPDOWN_DELETE = By.cssSelector(".cell-dropdown-menu .cell-dropdown-item.danger");
    private static final By DELETE_CONFIRM_MODAL = By.cssSelector(".delete-confirm-modal");
    private static final By CONFIRM_DELETE_BTN = By.cssSelector(".delete-confirm-modal .btn-modal-danger");
    private static final By SUCCESS_MESSAGE = By.cssSelector(".account-message.account-message-success");
    private static final By ADD_MODAL = By.cssSelector(".add-examiner-modal");
    private static final By ADD_MODAL_TEXT_INPUTS = By.cssSelector(".add-examiner-modal input[type='text']");
    private static final By ADD_MODAL_PASSWORD = By.cssSelector(".add-examiner-modal input[type='password']");
    private static final By PASSWORD_HINT = By.cssSelector(".add-examiner-modal .field-hint.not-pass");
    private static final By STATUS_TRIGGER = By.cssSelector(".cell-dropdown-trigger.status-trigger");
    private static final By STATUS_DROPDOWN_ITEM = By.cssSelector(".cell-dropdown-menu .cell-dropdown-item");

    public AccountExaminerPage(WebDriver driver, String baseUrl) {
        super(driver, baseUrl);
    }

    public void open() {
        navigateTo("/dashboard/account-examiner");
    }

    public void waitForPage() {
        waitVisible(PAGE);
    }

    public int getTabsCount() {
        return findElements(TABS).size();
    }

    public boolean isTableDisplayed() {
        return findElement(TABLE).isDisplayed();
    }

    public boolean hasAddButton() {
        return !findElements(ADD_BUTTON).isEmpty();
    }

    /** Có ít nhất một dòng trong bảng (để test xóa). */
    public boolean hasAtLeastOneRow() {
        return !findElements(ACTIONS_TRIGGER).isEmpty();
    }

    public void waitForTableRows() {
        waitVisible(TABLE_ROW);
    }

    /** Bấm nút action (dropdown) của dòng đầu tiên. */
    public void clickFirstRowActions() {
        List<WebElement> triggers = findElements(ACTIONS_TRIGGER);
        if (!triggers.isEmpty()) {
            triggers.get(0).click();
        }
    }

    /** Bấm mục Xóa trong dropdown. */
    public void clickDeleteInDropdown() {
        waitVisible(DROPDOWN_DELETE).click();
    }

    /** Nội dung modal xác nhận xóa. */
    public String getConfirmModalText() {
        return waitVisible(DELETE_CONFIRM_MODAL).getText();
    }

    public void clickConfirmDelete() {
        waitClickable(CONFIRM_DELETE_BTN).click();
    }

    /** Nội dung thông báo thành công sau khi xóa. */
    public String getSuccessMessageText() {
        return waitVisible(SUCCESS_MESSAGE).getText();
    }

    /** Bấm nút Thêm giám thị (mở modal). */
    public void clickAddExaminer() {
        waitClickable(ADD_BUTTON).click();
    }

    /** Đợi modal Thêm giám thị hiển thị. */
    public void waitForAddModal() {
        waitVisible(ADD_MODAL);
    }

    /** Nhập form thêm giám thị: examinerId, fullName, userName, password. */
    public void fillAddExaminerForm(String examinerId, String fullName, String userName, String password) {
        List<WebElement> textInputs = findElements(ADD_MODAL_TEXT_INPUTS);
        if (textInputs.size() >= 1) textInputs.get(0).sendKeys(examinerId);
        if (textInputs.size() >= 2) textInputs.get(1).sendKeys(fullName);
        if (textInputs.size() >= 3) textInputs.get(2).sendKeys(userName);
        List<WebElement> pwdInputs = findElements(ADD_MODAL_PASSWORD);
        if (!pwdInputs.isEmpty()) pwdInputs.get(0).sendKeys(password);
    }

    /** Lấy text hint mật khẩu (không đạt) trong modal. */
    public String getPasswordHintText() {
        List<WebElement> hints = findElements(PASSWORD_HINT);
        return hints.isEmpty() ? "" : hints.get(0).getText();
    }

    /** Bấm dropdown Status của dòng đầu tiên. */
    public void clickFirstRowStatusDropdown() {
        List<WebElement> triggers = findElements(STATUS_TRIGGER);
        if (!triggers.isEmpty()) triggers.get(0).click();
    }

    /** Chọn option trong dropdown status (Active, Inactive, Lock). */
    public void selectStatusOption(String label) {
        List<WebElement> items = findElements(STATUS_DROPDOWN_ITEM);
        for (WebElement item : items) {
            if (label.equals(item.getText().trim())) {
                item.click();
                return;
            }
        }
    }

    /** Lấy text status hiển thị của dòng đầu tiên (sau khi mở dropdown hoặc sau khi đổi). */
    public String getFirstRowStatusText() {
        List<WebElement> triggers = findElements(STATUS_TRIGGER);
        return triggers.isEmpty() ? "" : triggers.get(0).getText().replace("▼", "").trim();
    }
}
