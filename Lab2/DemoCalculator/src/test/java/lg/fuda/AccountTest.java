package lg.fuda;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AccountTest {
    
    @Test
    void testValidUsername_Min3() {
        Account account1 = new Account("abc", "a@b.com", "Pass123!");
        assertTrue(account1.isValidUsername(), "Username 'abc' (3 ký tự) should be valid");

        Account account2 = new Account("user", "a@b.com", "Pass123!");
        assertTrue(account2.isValidUsername(), "Username 'user' (4 ký tự) should be valid");
    }
    
    @Test
    void testInvalidUsername_TooShort() {
        Account account1 = new Account("ab", "a@b.com", "Pass123!");
        assertFalse(account1.isValidUsername(), "Username 'ab' (2 ký tự) should be invalid");

        Account account2 = new Account("a", "a@b.com", "Pass123!");
        assertFalse(account2.isValidUsername(), "Username 'a' (1 ký tự) should be invalid");
    }
    
    @Test
    void testInvalidUsername_Null() {
        Account account = new Account(null, "a@b.com", "Pass123!");
        assertFalse(account.isValidUsername(), "Username null should be invalid");
    }
}
