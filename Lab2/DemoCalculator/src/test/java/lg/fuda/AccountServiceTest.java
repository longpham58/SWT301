package lg.fuda;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AccountServiceTest {

    @ParameterizedTest(name = "[{index}] username={0}, password={1}, email={2} => expected={3}")
    @CsvFileSource(resources = "/test-data.csv", numLinesToSkip = 1)
    void registerAccount(String username, String password, String email, boolean expected) {
        Account account = new Account(username, email, password);
        AccountService service = new AccountService(account);
        assertEquals(expected, service.registerAccount());
    }

    @Test
    void registerAccount_success() {
        Account account = new Account("john123", "john@example.com", "Pass123!");
        AccountService service = new AccountService(account);
        assertTrue(service.registerAccount());
    }

    @Test
    void registerAccount_failures() {
        // username < 3
        assertFalse(new AccountService(new Account("ab", "john@example.com", "Pass123!")).registerAccount());
        // password thiếu ký tự đặc biệt
        assertFalse(new AccountService(new Account("john123", "john@example.com", "Pass1234")).registerAccount());
        // email sai
        assertFalse(new AccountService(new Account("john123", "bobmail.com", "Pass123!")).registerAccount());
    }

    @Test
    void isValidEmail() {
        AccountService service = new AccountService(new Account("john123", "john@example.com", "Pass123!"));
        assertTrue(service.isValidEmail("john@example.com"));
        assertTrue(service.isValidEmail("carol@domain.com"));
        assertFalse(service.isValidEmail("bobmail.com"));
        assertFalse(service.isValidEmail(""));
        assertFalse(service.isValidEmail(null));
    }

    @Test
    void isValidPassword() {
        AccountService service = new AccountService(new Account("john123", "john@example.com", "Pass123!"));
        assertTrue(service.isValidPassword("Pass123!"));
        assertFalse(service.isValidPassword("pass123!"));  // thiếu chữ hoa
        assertFalse(service.isValidPassword("PASS123!"));  // thiếu chữ thường
        assertFalse(service.isValidPassword("Pass1234"));  // thiếu ký tự đặc biệt
        assertFalse(service.isValidPassword("Pa!1"));      // <= 6 ký tự
    }
}

