import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Link,
  Container,
  Body,
  Hr,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>ShareTrack Verification Code</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your ShareTrack verification code: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Text style={logoText}>
              Share<span style={logoBold}>Track</span>
            </Text>
            <Text style={companyName}>Product of SoftwarenceLTD</Text>
          </Section>

          <Hr style={hr} />

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>Account Verification</Heading>
            <Text style={paragraph}>
              Hello <strong>{username}</strong>,
            </Text>
            <Text style={paragraph}>
              Welcome to ShareTrack! To secure your account and complete your
              registration registration pipeline, please use the verification
              code provided below.
            </Text>

            {/* OTP Box */}
            <Section style={otpBox}>
              <Text style={otpLabel}>Verification Code</Text>
              <Text style={otpValue}>{otp}</Text>
              <Text style={otpExpiry}>
                This security code is valid for the next 10 minutes.
              </Text>
            </Section>

            <Text style={paragraph}>
              If you did not initiate this request, please disregard this email
              safely. No changes will be applied to your profile information
              without verification.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer Section */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 <strong>SoftwarenceLTD</strong>. All rights reserved.{" "}
              <br />
              Digital solutions for the modern Share.
            </Text>
            <Row style={footerLinks}>
              <Link href="#" style={link}>
                Privacy Policy
              </Link>
              <span style={dot}> • </span>
              <Link href="#" style={link}>
                Support Center
              </Link>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* Styles */
const main = {
  backgroundColor: "#f4f7f9",
  fontFamily: '"Inter", "Arial", sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  width: "580px",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const logoText = {
  fontSize: "28px",
  color: "#0f172a",
  margin: "0",
  letterSpacing: "-0.5px",
};

const logoBold = {
  fontWeight: "bold",
  color: "#2563eb", // Modern Blue accent
};

const companyName = {
  fontSize: "12px",
  color: "#64748b",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  marginTop: "5px",
};

const contentSection = {
  padding: "20px 0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#1e293b",
  marginBottom: "30px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#475569",
  marginBottom: "20px",
};

const otpBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "30px",
  textAlign: "center" as const,
  border: "1px solid #e2e8f0",
  margin: "30px 0",
};

const otpLabel = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "10px",
  textTransform: "uppercase" as const,
};

const otpValue = {
  fontSize: "42px",
  fontWeight: "bold",
  color: "#0f172a",
  letterSpacing: "8px",
  margin: "0",
};

const otpExpiry = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "15px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "20px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "14px",
  color: "#94a3b8",
  lineHeight: "22px",
};

const footerLinks = {
  marginTop: "15px",
};

const link = {
  color: "#2563eb",
  textDecoration: "none",
  fontSize: "13px",
};

const dot = {
  color: "#cbd5e1",
  margin: "0 5px",
};
