package lg.fuda;

public class Account {
    private String username;
    private String email;
    private String password;

    public Account(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Username phải ít nhất 3 ký tự (không tính khoảng trắng đầu/cuối)
    public boolean isValidUsername() {
        if (username == null) {
            return false;
        }
        return username.trim().length() >= 3;
    }
}
