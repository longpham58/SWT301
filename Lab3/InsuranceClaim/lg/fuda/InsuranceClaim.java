package lg.fuda;

public class InsuranceClaim {
    public String claimId;
    public double amount;
    public String claimStatus;

    public InsuranceClaim(String id, double claimAmount) {
        claimId = id;
        amount = claimAmount;
        claimStatus = "Pending";
    }

    public boolean processClaim(String statusUpdate) {
        if ("Pending".equals(claimStatus)) {
            claimStatus = statusUpdate;
            return true;
        }
        return false;
    }

    public double calculatePayout() {
        if ("Approved".equals(claimStatus)) {
            return amount * 0.85; // 85% payout
        } else {
            return 0;
        }
    }

    public void updateClaimAmount(double newAmount) {
        amount = newAmount;
    }
}
