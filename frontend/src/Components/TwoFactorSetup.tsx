import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

interface TwoFactorSetupProps {
  onSuccess?: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onSuccess }) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCodeSvg, setQrCodeSvg] = useState("");
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [enabledAt, setEnabledAt] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);

  // Check 2FA status on mount
  useEffect(() => {
    check2FAStatus();
  }, []);

  // Countdown timer for email
  useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(() => {
        setEmailCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCountdown]);

  const check2FAStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/2fa/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setIs2FAEnabled(response.data.data.enabled);
        setEnabledAt(response.data.data.enabled_at);
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  };

  const handleGenerateQR = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/2fa/generate",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        setQrCodeSvg(response.data.data.qr_code_svg);
        setSecret(response.data.data.secret);
        setShowSetup(true);
        toast.success("QR code generated successfully");
      }
    } catch (error: any) {
      console.error("Error generating QR code:", error);
      toast.error(error.response?.data?.message || "Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/2fa/enable",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        toast.success("2FA enabled successfully");
        setIs2FAEnabled(true);
        setShowSetup(false);
        setOtp("");
        setQrCodeSvg("");
        setSecret("");
        check2FAStatus();
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Error enabling 2FA:", error);
      toast.error(error.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/2fa/disable",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        toast.success("2FA disabled successfully");
        setIs2FAEnabled(false);
        setOtp("");
        check2FAStatus();
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      toast.error(error.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDisableViaEmail = async () => {
    setSendingEmail(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/2fa/request-disable-email",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        setEmailSent(true);
        setEmailCountdown(60); // 60 seconds cooldown
        toast.success("Verification email sent. Please check your inbox.");
      }
    } catch (error: any) {
      console.error("Error requesting disable via email:", error);
      toast.error(error.response?.data?.message || "Failed to send verification email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Status</h3>
            <p className="text-sm text-muted-foreground">
              {is2FAEnabled ? "Enabled" : "Disabled"}
              {enabledAt && (
                <span className="block text-xs mt-1">
                  Enabled on: {new Date(enabledAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              is2FAEnabled
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {is2FAEnabled ? "Active" : "Inactive"}
          </div>
        </div>

        {/* Enable 2FA Section */}
        {!is2FAEnabled && !showSetup && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Enable Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Protect your account with an additional security layer using Google
                Authenticator or any compatible TOTP app.
              </p>
              <Button onClick={handleGenerateQR} disabled={isLoading}>
                {isLoading ? "Generating..." : "Get Started"}
              </Button>
            </div>
          </div>
        )}

        {/* Setup Section with QR Code */}
        {showSetup && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-4">Scan QR Code</h3>
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Or enter this code manually:
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <code className="text-sm break-all">{secret}</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enable-otp">
                    Enter the 6-digit code from your authenticator app
                  </Label>
                  <Input
                    id="enable-otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleEnable2FA}
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? "Verifying..." : "Enable 2FA"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSetup(false);
                      setOtp("");
                      setQrCodeSvg("");
                      setSecret("");
                    }}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disable 2FA Section */}
        {is2FAEnabled && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg border-destructive/50 bg-destructive/5">
              <h3 className="font-medium mb-2 text-destructive">
                Disable Two-Factor Authentication
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will remove the extra security layer from your account.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disable-otp">
                    Enter your current 6-digit code to disable 2FA
                  </Label>
                  <Input
                    id="disable-otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <Button
                  onClick={handleDisable2FA}
                  disabled={isLoading || otp.length !== 6}
                  variant="destructive"
                >
                  {isLoading ? "Verifying..." : "Disable 2FA"}
                </Button>

                {/* Lost Phone Link */}
                <div className="flex flex-col items-center gap-2 pt-3">
                  <button
                    onClick={handleRequestDisableViaEmail}
                    disabled={sendingEmail || emailCountdown > 0}
                    className="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingEmail ? (
                      "Sending..."
                    ) : emailCountdown > 0 ? (
                      `Resend in ${emailCountdown}s`
                    ) : (
                      "Lost your phone? Disable via email"
                    )}
                  </button>
                  {emailSent && (
                    <p className="text-xs text-green-600">
                      ✓ Verification email sent to your registered email
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
            How it works
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
            <li>Download Google Authenticator or any TOTP app</li>
            <li>Scan the QR code or enter the secret key manually</li>
            <li>Enter the 6-digit code to verify and enable 2FA</li>
            <li>You'll need this code every time you log in</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup;
