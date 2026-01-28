package lg.fuda;

import java.util.regex.Pattern;

public class AccountService {
    private final Account account;

    private static final int Min_Pass = 6; // password must be > 6

    // Simple email check: local@domain.tld (requires a dot in domain)
    private static final Pattern Email_Pattern = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)+$"
    );

    public AccountService(Account account) {
        this.account = account;
    }

    public boolean registerAccount() {
        if (account == null) {
            return false;
        }
        if (!account.isValidUsername()) {
            return false;
        }
        if (!isValidPassword(account.getPassword())) {
            return false;
        }
        return isValidEmail(account.getEmail());
    }

    public boolean isValidEmail(String email) {
        if (email == null) {
            return false;
        }
        String trimmed = email.trim();
        if (trimmed.isEmpty()) {
            return false;
        }
        return Email_Pattern.matcher(trimmed).matches();
    }

    // Password: > 6 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 ký tự đặc biệt
    public boolean isValidPassword(String password) {
        if (password == null || password.length() <= Min_Pass) {
            return false;
        }
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasSpecial = false;

        for (int i = 0; i < password.length(); i++) {
            char c = password.charAt(i);
            if (Character.isUpperCase(c)) {
                hasUpper = true;
            } else if (Character.isLowerCase(c)) {
                hasLower = true;
            } else if (!Character.isDigit(c)) {
                // special: not letter/digit (digits are allowed but not required)
                hasSpecial = true;
            }
        }

        return hasUpper && hasLower && hasSpecial;
    }
}

