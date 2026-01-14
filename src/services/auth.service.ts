import bcrypt from "bcryptjs";
import TempUser from "../models/tempUser.model";
import User from "../models/user.model";
import {
  sendWelcomeEmailOTP,
  sendEmailOTP,
  loginSendEmailOtp,
} from "../utils/sendEmail";
import { generateToken } from "../utils/jwt.utils";
import { MESSAGES } from "../constants/messages";

// Constants for OTP limits
const OTP_LIMIT = 3; // Max 3 OTP attempts
const OTP_WINDOW_MINUTES = 15; // 15-minute window for OTP attempts
const OTP_COOLDOWN_MINUTES = 5; // 5-minute cooldown between OTP sends
const OTP_EXPIRY_MINUTES = 10; // OTP expires after 10 minutes

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check if enough time has passed since last OTP send (cooldown)
 */
const canSendOTP = (lastOtpSentAt: Date | null): boolean => {
  if (!lastOtpSentAt) return true;

  const cooldownMs = OTP_COOLDOWN_MINUTES * 60 * 1000;
  const timeSinceLastOtp = Date.now() - new Date(lastOtpSentAt).getTime();

  return timeSinceLastOtp >= cooldownMs;
};

/**
 * Check if OTP attempts limit has been reached
 */
const checkOtpLimit = (
  otpAttempts: number,
  firstOtpAttemptAt: Date | null
): { allowed: boolean; resetAt?: Date } => {
  if (otpAttempts < OTP_LIMIT) {
    return { allowed: true };
  }

  if (!firstOtpAttemptAt) {
    return { allowed: true };
  }

  const windowMs = OTP_WINDOW_MINUTES * 60 * 1000;
  const timeSinceFirstAttempt =
    Date.now() - new Date(firstOtpAttemptAt).getTime();

  if (timeSinceFirstAttempt >= windowMs) {
    // Window has passed, reset is allowed
    return { allowed: true };
  }

  // Calculate when the limit resets
  const resetAt = new Date(new Date(firstOtpAttemptAt).getTime() + windowMs);

  return { allowed: false, resetAt };
};

/**
 * Map account_type from temp_users to role in users table
 */
const mapAccountTypeToRole = (
  accountType: "Client" | "Escort" | "Creator" | "Admin"
): "Admin" | "Creator" | "Client" | "Escort" => {
  switch (accountType) {
    case "Admin":
      return "Admin";
    case "Creator":
      return "Creator";
    case "Escort":
      return "Escort";
    case "Client":
      return "Client";
    default:
      return "Client";
  }
};

/**
 * Create temp user and send OTP
 */
export const signupService = async (data: {
  account_type: "Client" | "Escort" | "Creator" | "Admin";
  display_name: string;
  email: string;
  city: string;
  password: string;
  adult_policy?: boolean;
}) => {
  const { account_type, display_name, email, city, password, adult_policy } =
    data;

  // Check if email already exists in Users table
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error(MESSAGES.EMAIL_ALREADY_REGISTERED);
  }

  // Check if temp user exists
  let tempUser = await TempUser.findOne({ where: { email } });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  if (tempUser) {
    // Check cooldown
    if (!canSendOTP(tempUser.last_otp_sent_at)) {
      const lastSent = new Date(tempUser.last_otp_sent_at!);
      const cooldownEnd = new Date(
        lastSent.getTime() + OTP_COOLDOWN_MINUTES * 60 * 1000
      );
      const minutesLeft = Math.ceil(
        (cooldownEnd.getTime() - Date.now()) / (60 * 1000)
      );
      throw new Error(
        MESSAGES.OTP_COOLDOWN_WAIT.replace(
          "{minutesLeft}",
          minutesLeft.toString()
        )
      );
    }

    // Check OTP limit
    const limitCheck = checkOtpLimit(
      tempUser.otp_attempts,
      tempUser.first_otp_attempt_at
    );

    if (!limitCheck.allowed) {
      const resetAt = limitCheck.resetAt!;
      const minutesLeft = Math.ceil(
        (resetAt.getTime() - Date.now()) / (60 * 1000)
      );
      throw new Error(
        MESSAGES.OTP_LIMIT_REACHED.replace(
          "{minutesLeft}",
          minutesLeft.toString()
        )
      );
    }

    // Reset attempts if window has passed
    if (
      tempUser.first_otp_attempt_at &&
      Date.now() - new Date(tempUser.first_otp_attempt_at).getTime() >=
        OTP_WINDOW_MINUTES * 60 * 1000
    ) {
      tempUser.otp_attempts = 0;
      tempUser.first_otp_attempt_at = null;
    }

    // Update existing temp user
    const otp = generateOTP();
    tempUser.account_type = account_type;
    tempUser.display_name = display_name;
    tempUser.city = city;
    tempUser.password = hashedPassword;
    tempUser.adult_policy = adult_policy ?? true;
    tempUser.current_otp = otp;
    tempUser.otp_attempts += 1;
    tempUser.last_otp_sent_at = new Date();

    if (!tempUser.first_otp_attempt_at) {
      tempUser.first_otp_attempt_at = new Date();
    }

    await tempUser.save();
  } else {
    // Create new temp user
    const otp = generateOTP();
    tempUser = await TempUser.create({
      account_type,
      display_name,
      email,
      city,
      password: hashedPassword,
      adult_policy: adult_policy ?? true,
      current_otp: otp,
      otp_attempts: 1,
      last_otp_sent_at: new Date(),
      first_otp_attempt_at: new Date(),
    });
  }

  // Send OTP email
  try {
    await sendWelcomeEmailOTP(
      email,
      "Welcome! Verify Your Email",
      `Your OTP is ${tempUser.current_otp}`,
      {
        name: display_name,
        otp: tempUser.current_otp!,
      }
    );
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error(MESSAGES.EMAIL_SEND_FAILED);
  }

  return {
    message: MESSAGES.OTP_SENT_SUCCESS,
    email: tempUser.email,
  };
};

/**
 * Resend OTP to existing temp user
 */
export const resendOtpService = async (data: { email: string }) => {
  const { email } = data;

  // Check if email already exists in Users table
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error(MESSAGES.EMAIL_ALREADY_REGISTERED);
  }

  // Find temp user
  const tempUser = await TempUser.findOne({ where: { email } });

  if (!tempUser) {
    throw new Error(MESSAGES.NO_SIGNUP_FOUND);
  }

  // Check if already verified
  if (tempUser.is_verified) {
    throw new Error(MESSAGES.EMAIL_ALREADY_VERIFIED);
  }

  // Check cooldown
  if (!canSendOTP(tempUser.last_otp_sent_at)) {
    const lastSent = new Date(tempUser.last_otp_sent_at!);
    const cooldownEnd = new Date(
      lastSent.getTime() + OTP_COOLDOWN_MINUTES * 60 * 1000
    );
    const minutesLeft = Math.ceil(
      (cooldownEnd.getTime() - Date.now()) / (60 * 1000)
    );
    throw new Error(
      MESSAGES.OTP_COOLDOWN_WAIT.replace(
        "{minutesLeft}",
        minutesLeft.toString()
      )
    );
  }

  // Check OTP limit
  const limitCheck = checkOtpLimit(
    tempUser.otp_attempts,
    tempUser.first_otp_attempt_at
  );

  if (!limitCheck.allowed) {
    const resetAt = limitCheck.resetAt!;
    const minutesLeft = Math.ceil(
      (resetAt.getTime() - Date.now()) / (60 * 1000)
    );
    throw new Error(
      MESSAGES.OTP_LIMIT_REACHED.replace(
        "{minutesLeft}",
        minutesLeft.toString()
      )
    );
  }

  // Reset attempts if window has passed
  if (
    tempUser.first_otp_attempt_at &&
    Date.now() - new Date(tempUser.first_otp_attempt_at).getTime() >=
      OTP_WINDOW_MINUTES * 60 * 1000
  ) {
    tempUser.otp_attempts = 0;
    tempUser.first_otp_attempt_at = null;
  }

  // Generate new OTP
  const otp = generateOTP();
  tempUser.current_otp = otp;
  tempUser.otp_attempts += 1;
  tempUser.last_otp_sent_at = new Date();

  if (!tempUser.first_otp_attempt_at) {
    tempUser.first_otp_attempt_at = new Date();
  }

  await tempUser.save();

  // Send OTP email
  try {
    await sendWelcomeEmailOTP(
      email,
      "Welcome! Verify Your Email",
      `Your OTP is ${tempUser.current_otp}`,
      {
        name: tempUser.display_name,
        otp: tempUser.current_otp!,
      }
    );
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error(MESSAGES.EMAIL_SEND_FAILED);
  }

  return {
    message: MESSAGES.OTP_SENT_SUCCESS,
    email: tempUser.email,
  };
};

/**
 * Verify OTP and create user account
 */
export const verifyOtpService = async (data: {
  email: string;
  otp: string;
}) => {
  const { email, otp } = data;

  // Find temp user
  const tempUser = await TempUser.findOne({ where: { email } });

  if (!tempUser) {
    throw new Error(MESSAGES.INVALID_EMAIL_OR_OTP);
  }

  // Check if already verified
  if (tempUser.is_verified) {
    throw new Error(MESSAGES.EMAIL_ALREADY_VERIFIED);
  }

  // Check OTP
  if (!tempUser.current_otp || tempUser.current_otp !== otp) {
    // Increment attempts
    tempUser.otp_attempts += 1;

    // Check if limit reached
    const limitCheck = checkOtpLimit(
      tempUser.otp_attempts,
      tempUser.first_otp_attempt_at
    );

    if (!limitCheck.allowed) {
      const resetAt = limitCheck.resetAt!;
      const minutesLeft = Math.ceil(
        (resetAt.getTime() - Date.now()) / (60 * 1000)
      );
      await tempUser.save();
      throw new Error(
        MESSAGES.OTP_MAX_ATTEMPTS_REACHED.replace(
          "{minutesLeft}",
          minutesLeft.toString()
        )
      );
    }

    await tempUser.save();
    throw new Error(MESSAGES.INVALID_OTP);
  }

  // Check OTP expiry (10 minutes)
  if (tempUser.last_otp_sent_at) {
    const otpAge = Date.now() - new Date(tempUser.last_otp_sent_at).getTime();
    const expiryMs = OTP_EXPIRY_MINUTES * 60 * 1000;

    if (otpAge > expiryMs) {
      throw new Error(MESSAGES.OTP_EXPIRED);
    }
  }

  // Check if user already exists in Users table
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    // Clean up temp user
    await tempUser.destroy();
    throw new Error(MESSAGES.EMAIL_ALREADY_REGISTERED);
  }

  // Map account_type to role
  const role = mapAccountTypeToRole(tempUser.account_type);

  // Create user in Users table
  const user = await User.create({
    name: tempUser.display_name,
    profile_name: tempUser.display_name,
    username: tempUser.email.split("@")[0] + "_" + Date.now(), // Generate unique username
    email: tempUser.email,
    password: tempUser.password,
    city: tempUser.city,
    role: role,
    status: "Pending", // Default status
    is_verified: true, // Verified via OTP
    reset_password_otp_attempts: 0,
    pass_status: "Default",
    dailyFreeUnlocks: 3,
    login_otp_attempts: 0,
    login_otp_first_attempt_at: null,
  });

  // Mark temp user as verified and clean up
  await tempUser.destroy();

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    message: MESSAGES.EMAIL_VERIFIED_SUCCESS,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_verified: user.is_verified,
    },
  };
};

/**
 * Forgot Password - Send OTP to user's email for password reset
 */
export const forgotPasswordService = async (data: { email: string }) => {
  const { email } = data;

  // Find user by email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error(MESSAGES.EMAIL_NOT_FOUND);
  }

  // Check cooldown
  if (!canSendOTP(user.reset_password_otp_sent_at)) {
    const lastSent = new Date(user.reset_password_otp_sent_at!);
    const cooldownEnd = new Date(
      lastSent.getTime() + OTP_COOLDOWN_MINUTES * 60 * 1000
    );
    const minutesLeft = Math.ceil(
      (cooldownEnd.getTime() - Date.now()) / (60 * 1000)
    );
    throw new Error(
      MESSAGES.OTP_COOLDOWN_WAIT.replace(
        "{minutesLeft}",
        minutesLeft.toString()
      )
    );
  }

  // Check OTP limit
  const limitCheck = checkOtpLimit(
    user.reset_password_otp_attempts,
    user.reset_password_otp_first_attempt_at
  );

  if (!limitCheck.allowed) {
    const resetAt = limitCheck.resetAt!;
    const minutesLeft = Math.ceil(
      (resetAt.getTime() - Date.now()) / (60 * 1000)
    );
    throw new Error(
      MESSAGES.OTP_LIMIT_REACHED.replace(
        "{minutesLeft}",
        minutesLeft.toString()
      )
    );
  }

  // Reset attempts if window has passed
  if (
    user.reset_password_otp_first_attempt_at &&
    Date.now() - new Date(user.reset_password_otp_first_attempt_at).getTime() >=
      OTP_WINDOW_MINUTES * 60 * 1000
  ) {
    user.reset_password_otp_attempts = 0;
    user.reset_password_otp_first_attempt_at = null;
  }

  // Generate new OTP
  const otp = generateOTP();
  user.reset_password_otp = otp;
  user.reset_password_otp_attempts += 1;
  user.reset_password_otp_sent_at = new Date();

  if (!user.reset_password_otp_first_attempt_at) {
    user.reset_password_otp_first_attempt_at = new Date();
  }

  await user.save();

  // Send OTP email using sendEmailOTP
  try {
    await sendEmailOTP(
      email,
      "Reset Your Password",
      `Your password reset OTP is ${otp}`,
      {
        name: user.name || user.profile_name || "User",
        otp: otp,
      }
    );
  } catch (error) {
    console.error("Error sending password reset OTP email:", error);
    throw new Error(MESSAGES.EMAIL_SEND_FAILED);
  }

  return {
    message: MESSAGES.PASSWORD_RESET_OTP_SENT,
    email: user.email,
  };
};

/**
 * Reset Password - Verify OTP and reset password
 */
export const resetPasswordService = async (data: {
  email: string;
  otp?: string;
  new_pass: string;
  old_pass?: string;
}) => {
  const { email, otp, new_pass, old_pass } = data;

  // Find user by email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error(MESSAGES.EMAIL_NOT_FOUND);
  }

  // If old_pass is provided, verify it (for change password flow - no OTP needed)
  if (old_pass) {
    // Check if old and new passwords are the same
    if (old_pass === new_pass) {
      throw new Error(MESSAGES.OLD_NEW_PASSWORD_SAME);
    }

    if (!user.password) {
      throw new Error(MESSAGES.INVALID_OLD_PASSWORD);
    }
    const isOldPasswordValid = await bcrypt.compare(old_pass, user.password);
    if (!isOldPasswordValid) {
      throw new Error(MESSAGES.INVALID_OLD_PASSWORD);
    }
    // If old password is valid, skip OTP verification
  } else {
    // Forgot password flow - OTP is required
    if (!otp) {
      throw new Error("OTP is required for password reset");
    }

    // Check OTP
    if (!user.reset_password_otp || user.reset_password_otp !== otp) {
      // Increment attempts
      user.reset_password_otp_attempts += 1;

      // Check if limit reached
      const limitCheck = checkOtpLimit(
        user.reset_password_otp_attempts,
        user.reset_password_otp_first_attempt_at
      );

      if (!limitCheck.allowed) {
        const resetAt = limitCheck.resetAt!;
        const minutesLeft = Math.ceil(
          (resetAt.getTime() - Date.now()) / (60 * 1000)
        );
        await user.save();
        throw new Error(
          MESSAGES.OTP_MAX_ATTEMPTS_REACHED.replace(
            "{minutesLeft}",
            minutesLeft.toString()
          )
        );
      }

      await user.save();
      throw new Error(MESSAGES.INVALID_OTP);
    }

    // Check OTP expiry (10 minutes)
    if (user.reset_password_otp_sent_at) {
      const otpAge =
        Date.now() - new Date(user.reset_password_otp_sent_at).getTime();
      const expiryMs = OTP_EXPIRY_MINUTES * 60 * 1000;

      if (otpAge > expiryMs) {
        throw new Error(MESSAGES.OTP_EXPIRED);
      }
    }
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(new_pass, 10);

  // Update password
  user.password = hashedPassword;
  user.pass_status = "Changed";

  // Clear OTP fields only if OTP was used (forgot password flow)
  if (!old_pass) {
    user.reset_password_otp = null;
    user.reset_password_otp_sent_at = null;
    user.reset_password_otp_attempts = 0;
    user.reset_password_otp_first_attempt_at = null;
  }

  await user.save();

  return {
    message: old_pass
      ? MESSAGES.PASSWORD_CHANGE_SUCCESS
      : MESSAGES.PASSWORD_RESET_SUCCESS,
  };
};

/**
 * Login - Authenticate user with email and password, then send OTP
 */
export const loginService = async (data: {
  email: string;
  password: string;
}) => {
  const { email, password } = data;

  // Find user by email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error(MESSAGES.INVALID_EMAIL_OR_PASSWORD);
  }

  // Check if user has a password
  if (!user.password) {
    throw new Error(MESSAGES.INVALID_EMAIL_OR_PASSWORD);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error(MESSAGES.INVALID_EMAIL_OR_PASSWORD);
  }

  // Check if account is verified
  if (!user.is_verified) {
    throw new Error(MESSAGES.ACCOUNT_NOT_VERIFIED);
  }

  // Check account status
  if (user.status === "Block") {
    throw new Error(MESSAGES.ACCOUNT_BLOCKED);
  }

  if (user.status === "Suspend") {
    throw new Error(MESSAGES.ACCOUNT_SUSPENDED);
  }

  if (user.status === "Inactive") {
    throw new Error(MESSAGES.ACCOUNT_INACTIVE);
  }

  // Check cooldown before sending OTP
  if (!canSendOTP(user.login_otp_sent_at)) {
    const lastSent = user.login_otp_sent_at
      ? new Date(user.login_otp_sent_at)
      : new Date();
    const cooldownMs = OTP_COOLDOWN_MINUTES * 60 * 1000;
    const timeUntilNext = cooldownMs - (Date.now() - lastSent.getTime());
    const minutesLeft = Math.ceil(timeUntilNext / (60 * 1000));
    throw new Error(
      MESSAGES.OTP_COOLDOWN_ACTIVE.replace(
        "{minutesLeft}",
        minutesLeft.toString()
      )
    );
  }

  // Generate OTP
  const otp = generateOTP();

  // Update user with OTP
  user.login_otp = otp;
  user.login_otp_sent_at = new Date();

  // Reset attempts if window expired
  const limitCheck = checkOtpLimit(
    user.login_otp_attempts,
    user.login_otp_first_attempt_at
  );
  if (limitCheck.allowed && user.login_otp_attempts >= OTP_LIMIT) {
    user.login_otp_attempts = 0;
    user.login_otp_first_attempt_at = null;
  }

  await user.save();

  // Send OTP email
  await loginSendEmailOtp(
    user.email,
    "Login Verification - Seductive Seekers",
    `Your login OTP is ${otp}. This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.`,
    {
      name: user.name || user.profile_name || user.email,
      otp,
    }
  );

  return {
    message: MESSAGES.LOGIN_OTP_SENT,
  };
};

/**
 * Verify Login OTP - Verify OTP and return token
 */
export const verifyLoginOtpService = async (data: {
  email: string;
  otp: string;
}) => {
  const { email, otp } = data;

  // Find user by email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error(MESSAGES.EMAIL_NOT_FOUND);
  }

  // Check if OTP exists
  if (!user.login_otp) {
    throw new Error(MESSAGES.OTP_NOT_FOUND);
  }

  // Check OTP
  if (user.login_otp !== otp) {
    // Increment attempts
    if (!user.login_otp_first_attempt_at) {
      user.login_otp_first_attempt_at = new Date();
    }
    user.login_otp_attempts += 1;

    // Check if limit reached
    const limitCheck = checkOtpLimit(
      user.login_otp_attempts,
      user.login_otp_first_attempt_at
    );

    if (!limitCheck.allowed) {
      const resetAt = limitCheck.resetAt!;
      const minutesLeft = Math.ceil(
        (resetAt.getTime() - Date.now()) / (60 * 1000)
      );
      await user.save();
      throw new Error(
        MESSAGES.OTP_MAX_ATTEMPTS_REACHED.replace(
          "{minutesLeft}",
          minutesLeft.toString()
        )
      );
    }

    await user.save();
    throw new Error(MESSAGES.INVALID_OTP);
  }

  // Check OTP expiry (10 minutes)
  if (user.login_otp_sent_at) {
    const otpAge = Date.now() - new Date(user.login_otp_sent_at).getTime();
    const expiryMs = OTP_EXPIRY_MINUTES * 60 * 1000;

    if (otpAge > expiryMs) {
      throw new Error(MESSAGES.OTP_EXPIRED);
    }
  }

  // Clear OTP fields
  user.login_otp = null;
  user.login_otp_sent_at = null;
  user.login_otp_attempts = 0;
  user.login_otp_first_attempt_at = null;

  await user.save();

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    message: MESSAGES.LOGIN_SUCCESS,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profile_name: user.profile_name,
      username: user.username,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
    },
  };
};

/**
 * Resend Login OTP - Resend login OTP to user's email
 */
export const resendLoginOtpService = async (data: { email: string }) => {
  const { email } = data;

  // Find user by email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error(MESSAGES.EMAIL_NOT_FOUND);
  }

  // Check if account is verified
  if (!user.is_verified) {
    throw new Error(MESSAGES.ACCOUNT_NOT_VERIFIED);
  }

  // Check account status
  if (user.status === "Block") {
    throw new Error(MESSAGES.ACCOUNT_BLOCKED);
  }

  if (user.status === "Suspend") {
    throw new Error(MESSAGES.ACCOUNT_SUSPENDED);
  }

  if (user.status === "Inactive") {
    throw new Error(MESSAGES.ACCOUNT_INACTIVE);
  }

  // Check cooldown
  if (!canSendOTP(user.login_otp_sent_at)) {
    const lastSent = user.login_otp_sent_at
      ? new Date(user.login_otp_sent_at)
      : new Date();
    const cooldownMs = OTP_COOLDOWN_MINUTES * 60 * 1000;
    const timeUntilNext = cooldownMs - (Date.now() - lastSent.getTime());
    const minutesLeft = Math.ceil(timeUntilNext / (60 * 1000));
    throw new Error(
      MESSAGES.OTP_COOLDOWN_ACTIVE.replace(
        "{minutesLeft}",
        minutesLeft.toString()
      )
    );
  }

  // Check OTP limit
  const limitCheck = checkOtpLimit(
    user.login_otp_attempts,
    user.login_otp_first_attempt_at
  );

  if (!limitCheck.allowed) {
    const resetAt = limitCheck.resetAt!;
    const minutesLeft = Math.ceil(
      (resetAt.getTime() - Date.now()) / (60 * 1000)
    );
    throw new Error(
      MESSAGES.OTP_MAX_ATTEMPTS_REACHED.replace(
        "{minutesLeft}",
        minutesLeft.toString()
      )
    );
  }

  // Reset attempts if window has passed
  if (
    user.login_otp_first_attempt_at &&
    Date.now() - new Date(user.login_otp_first_attempt_at).getTime() >=
      OTP_WINDOW_MINUTES * 60 * 1000
  ) {
    user.login_otp_attempts = 0;
    user.login_otp_first_attempt_at = null;
  }

  // Generate new OTP
  const otp = generateOTP();
  user.login_otp = otp;
  user.login_otp_attempts += 1;
  user.login_otp_sent_at = new Date();

  if (!user.login_otp_first_attempt_at) {
    user.login_otp_first_attempt_at = new Date();
  }

  await user.save();

  // Send OTP email
  try {
    await loginSendEmailOtp(
      email,
      "Login Verification - Seductive Seekers",
      `Your login OTP is ${otp}. This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      {
        name: user.name || user.profile_name || user.email,
        otp,
      }
    );
  } catch (error) {
    console.error("Error sending login OTP email:", error);
    throw new Error(MESSAGES.EMAIL_SEND_FAILED);
  }

  return {
    message: MESSAGES.LOGIN_OTP_SENT,
    email: user.email,
  };
};

/**
 * Logout Service - Simple service for logout (no DB operations needed)
 */
export const logoutService = async (): Promise<{ message: string }> => {
  return {
    message: MESSAGES.LOGOUT_SUCCESS,
  };
};
