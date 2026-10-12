export const SAMPLES = [
  {
    id: "ecommerce",
    name: "E-Commerce Checkout & Inventory",
    description: "Standard online shopping flow with payment, cart, and order tracking.",
    text: `1. The user must be able to add products to the shopping cart and update quantities.
2. The checkout service must encrypt all credit card numbers using PCI-DSS compliant AES-256 before saving to the database.
3. The checkout page should load within 800 milliseconds under a concurrent load of 5,000 active shoppers.
4. The system should send an email notification with receipt details within 30 seconds after payment confirmation.
5. The administrator can export monthly sales reports in CSV format.
6. The user interface must be user-friendly and intuitive across mobile and desktop viewports.
7. Orders should be automatically cancelled if payment confirmation is not received within 15 minutes.
8. The application may offer social login via Google and Apple OAuth in future releases.
9. All product search queries must return results fast with real-time autocomplete suggestions.`
  },
  {
    id: "healthcare",
    name: "Healthcare Patient Portal (HIPAA)",
    description: "Secure medical records system with access control and doctor scheduling.",
    text: `1. Patients must log in using two-factor authentication before viewing electronic health records.
2. The system must comply strictly with HIPAA privacy regulations for all stored patient diagnosis notes.
3. Doctors should be able to e-prescribe medication and transmit orders directly to certified pharmacies.
4. Laboratory test results must be securely encrypted both in transit (TLS 1.3) and at rest.
5. The appointment booking module can send optional SMS appointment reminders 24 hours prior to scheduled visits.
6. The audit log must record all patient record accesses with timestamp, user ID, and IP address.
7. The patient dashboard should display health metrics in a seamless and modern layout.
8. System backups must be executed every 6 hours and replicated to a geographically distinct secondary data center.`
  },
  {
    id: "fintech",
    name: "Fintech Real-Time Payment Gateway",
    description: "High-throughput financial transaction processing with fraud detection.",
    text: `1. The payment API must process incoming payment requests within 250 milliseconds with 99.99% availability.
2. All payment transactions must support idempotency keys to strictly prevent duplicate billing charges.
3. The fraud detection engine should flag and suspend any transaction exceeding $10,000 with a risk score above 85.
4. The webhook dispatcher must retry failed notification deliveries with exponential backoff up to 5 attempts.
5. Merchant administrators can customize payout schedules on weekly or monthly cycles.
6. The financial reporting service should generate monthly reconciliation statements in under 5 seconds.
7. Sensitive API secrets must be rotated every 90 days and never exposed in client-facing responses.
8. The mobile checkout SDK may support biometric authentication on compatible iOS and Android devices.`
  }
];
