package lg_test.fuda;

import lg.fuda.InsuranceClaim;

public class InsuranceClaimTest {
    public static void main(String[] args) {
        InsuranceClaim claim = new InsuranceClaim("C1", 1000);
        assertTrue(claim.processClaim("Approved"), "Should update when status is Pending");
        assertEquals(850.0, claim.calculatePayout(), "Payout should be 85% when approved");

        InsuranceClaim claim2 = new InsuranceClaim("C2", 200);
        claim2.processClaim("Rejected");
        assertEquals(0.0, claim2.calculatePayout(), "Payout should be 0 when not approved");

        System.out.println("All tests passed.");
    }

    private static void assertEquals(double expected, double actual, String message) {
        double epsilon = 0.0001;
        if (Math.abs(expected - actual) > epsilon) {
            throw new AssertionError(message + " (expected " + expected + ", got " + actual + ")");
        }
    }

    private static void assertTrue(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
