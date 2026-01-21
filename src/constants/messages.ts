const MESSAGES = {
  // Email verification messages
  EMAIL_VERIFIED_SUCCESS: "Email verified successfully. Account created.",
  EMAIL_ALREADY_VERIFIED: "Email already verified. Please login.",
  EMAIL_ALREADY_REGISTERED: "Email already registered. Please login instead.",
  EMAIL_VERIFICATION_FAILED: "Email verification failed. Please try again.",
  EMAIL_VERIFICATION_SUCCESS: "Email verification successful. Please login.",

  // OTP messages
  INVALID_EMAIL_OR_OTP: "Invalid email or OTP. Please sign up again.",
  INVALID_OTP: "Invalid OTP. Please check and try again.",
  OTP_MAX_ATTEMPTS_REACHED:
    "Invalid OTP. Maximum attempts reached. Please try again in {minutesLeft} minute(s).",
  OTP_EXPIRED: "OTP has expired. Please request a new OTP.",
  OTP_SENT_SUCCESS:
    "OTP sent to your email. Please verify to complete registration.",
  OTP_COOLDOWN_WAIT:
    "Please wait {minutesLeft} minute(s) before requesting another OTP.",
  OTP_LIMIT_REACHED:
    "OTP limit reached. Please try again in {minutesLeft} minute(s).",
  NO_SIGNUP_FOUND: "No signup found for this email. Please sign up first.",

  // Email sending messages
  EMAIL_SEND_FAILED: "Failed to send OTP email. Please try again.",

  // Validation messages
  VALIDATION_FAILED: "Validation failed",

  // Error messages
  SIGNUP_FAILED: "Signup failed",
  SIGNUP_ERROR: "An error occurred during signup",
  OTP_VERIFICATION_FAILED: "OTP verification failed",
  OTP_VERIFICATION_ERROR: "An error occurred during OTP verification",
  RESEND_OTP_FAILED: "Failed to resend OTP",
  RESEND_OTP_ERROR: "An error occurred while resending OTP",

  // Password reset messages
  PASSWORD_RESET_OTP_SENT: "Password reset OTP sent to your email.",
  PASSWORD_RESET_SUCCESS: "Password reset successfully.",
  PASSWORD_CHANGE_SUCCESS: "Password changed successfully.",
  INVALID_OLD_PASSWORD: "Invalid old password.",
  OLD_NEW_PASSWORD_SAME: "Old password and new password cannot be the same.",
  EMAIL_NOT_FOUND: "Email not found. Please check your email address.",
  PASSWORD_RESET_FAILED: "Password reset failed",
  PASSWORD_RESET_ERROR: "An error occurred during password reset",
  FORGOT_PASSWORD_FAILED: "Failed to send password reset OTP",
  FORGOT_PASSWORD_ERROR: "An error occurred while sending password reset OTP",

  // Login messages
  LOGIN_SUCCESS: "Login successful.",
  LOGIN_OTP_SENT:
    "Login OTP sent to your email. Please verify to complete login.",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password.",
  ACCOUNT_NOT_VERIFIED: "Account not verified. Please verify your email first.",
  ACCOUNT_BLOCKED: "Your account has been blocked. Please contact support.",
  ACCOUNT_SUSPENDED: "Your account has been suspended. Please contact support.",
  ACCOUNT_INACTIVE: "Your account is inactive. Please contact support.",
  LOGIN_FAILED: "Login failed",
  LOGIN_ERROR: "An error occurred during login",
  OTP_NOT_FOUND: "OTP not found. Please request a new OTP.",
  OTP_COOLDOWN_ACTIVE:
    "Please wait {minutesLeft} minute(s) before requesting another OTP.",

  // Logout messages
  LOGOUT_SUCCESS: "Logged out successfully.",
  LOGOUT_FAILED: "Logout failed",
  LOGOUT_ERROR: "An error occurred during logout",

  // User fetch messages
  USER_FETCHED_SUCCESS: "User data fetched successfully.",
  USER_NOT_FOUND: "User not found.",
  USER_FETCH_FAILED: "Failed to fetch user data",
  USER_FETCH_ERROR: "An error occurred while fetching user data",

  // Client Preferences messages
  CLIENT_PREFERENCES_SAVED: "Client preferences saved successfully.",
  CLIENT_PREFERENCES_UPDATED: "Client preferences updated successfully.",
  CLIENT_PREFERENCES_FETCHED: "Client preferences fetched successfully.",
  CLIENT_PREFERENCES_DELETED: "Client preferences deleted successfully.",
  CLIENT_PREFERENCES_NOT_FOUND: "Client preferences not found.",
  CLIENT_PREFERENCES_SAVE_FAILED: "Failed to save client preferences",
  CLIENT_PREFERENCES_SAVE_ERROR:
    "An error occurred while saving client preferences",
  CLIENT_PREFERENCES_UPDATE_FAILED: "Failed to update client preferences",
  CLIENT_PREFERENCES_UPDATE_ERROR:
    "An error occurred while updating client preferences",
  CLIENT_PREFERENCES_FETCH_FAILED: "Failed to fetch client preferences",
  CLIENT_PREFERENCES_FETCH_ERROR:
    "An error occurred while fetching client preferences",
  CLIENT_PREFERENCES_DELETE_FAILED: "Failed to delete client preferences",
  CLIENT_PREFERENCES_DELETE_ERROR:
    "An error occurred while deleting client preferences",
  ONLY_CLIENTS_CAN_SET_PREFERENCES: "Only clients can set preferences.",

  // Country messages
  COUNTRIES_FETCHED: "Countries fetched successfully.",
  COUNTRY_FETCHED: "Country fetched successfully.",
  COUNTRY_NOT_FOUND: "Country not found.",
  COUNTRIES_FETCH_FAILED: "Failed to fetch countries",
  COUNTRIES_FETCH_ERROR: "An error occurred while fetching countries",
  COUNTRY_FETCH_FAILED: "Failed to fetch country",
  COUNTRY_FETCH_ERROR: "An error occurred while fetching country",
  INVALID_COUNTRY_ID: "Invalid country ID",
  INVALID_COUNTRY_SHORTCODE: "Invalid country shortcode",

  // City messages
  CITIES_FETCHED: "Cities fetched successfully.",
  CITY_FETCHED: "City fetched successfully.",
  CITY_NOT_FOUND: "City not found.",
  CITIES_FETCH_FAILED: "Failed to fetch cities",
  CITIES_FETCH_ERROR: "An error occurred while fetching cities",
  CITY_FETCH_FAILED: "Failed to fetch city",
  CITY_FETCH_ERROR: "An error occurred while fetching city",
  INVALID_CITY_ID: "Invalid city ID",

  // Tag messages
  TAGS_FETCHED: "Tags fetched successfully.",
  TAGS_FETCH_FAILED: "Failed to fetch tags",
  TAGS_FETCH_ERROR: "An error occurred while fetching tags",
  TAG_NOT_FOUND: "Tag not found.",

  // User Tags messages
  USER_TAG_ADDED: "Tag added to user profile successfully.",
  USER_TAG_REMOVED: "Tag removed from user profile successfully.",
  USER_TAGS_FETCHED: "User tags fetched successfully.",
  USER_TAG_ALREADY_EXISTS: "User already has this tag.",
  USER_TAG_NOT_FOUND: "User tag not found.",
  USER_TAG_ADD_FAILED: "Failed to add tag to user profile",
  USER_TAG_ADD_ERROR: "An error occurred while adding tag to user profile",
  USER_TAG_REMOVE_FAILED: "Failed to remove tag from user profile",
  USER_TAG_REMOVE_ERROR:
    "An error occurred while removing tag from user profile",
  USER_TAGS_FETCH_FAILED: "Failed to fetch user tags",
  USER_TAGS_FETCH_ERROR: "An error occurred while fetching user tags",
  INVALID_TAG_ID: "Invalid tag ID",

  // User Availability messages
  USER_AVAILABILITY_CREATED: "User availability created successfully.",
  USER_AVAILABILITY_FETCHED: "User availability fetched successfully.",
  USER_AVAILABILITY_UPDATED: "User availability updated successfully.",
  USER_AVAILABILITY_DELETED: "User availability deleted successfully.",
  USER_AVAILABILITY_NOT_FOUND: "User availability not found.",
  USER_AVAILABILITY_CREATE_FAILED: "Failed to create user availability",
  USER_AVAILABILITY_CREATE_ERROR:
    "An error occurred while creating user availability",
  USER_AVAILABILITY_FETCH_FAILED: "Failed to fetch user availability",
  USER_AVAILABILITY_FETCH_ERROR:
    "An error occurred while fetching user availability",
  USER_AVAILABILITY_UPDATE_FAILED: "Failed to update user availability",
  USER_AVAILABILITY_UPDATE_ERROR:
    "An error occurred while updating user availability",
  USER_AVAILABILITY_DELETE_FAILED: "Failed to delete user availability",
  USER_AVAILABILITY_DELETE_ERROR:
    "An error occurred while deleting user availability",
  INVALID_AVAILABILITY_ID: "Invalid availability ID",

  // Gallery messages
  GALLERY_IMAGES_UPLOADED: "Images uploaded successfully.",
  GALLERY_IMAGES_UPLOAD_FAILED: "Failed to upload images",
  GALLERY_IMAGES_UPLOAD_ERROR: "An error occurred while uploading images",
  GALLERY_IMAGES_FETCHED: "Gallery images fetched successfully.",
  GALLERY_IMAGES_FETCH_FAILED: "Failed to fetch gallery images",
  GALLERY_IMAGES_FETCH_ERROR: "An error occurred while fetching gallery images",
  GALLERY_IMAGE_DELETED: "Image deleted successfully.",
  GALLERY_IMAGE_DELETE_FAILED: "Failed to delete image",
  GALLERY_IMAGE_DELETE_ERROR: "An error occurred while deleting image",
  INVALID_IMAGE_FILE: "Invalid image file. Only image files are allowed.",
  INVALID_MEDIA_FILE:
    "Invalid media file. Only image and video files are allowed.",
  MEDIA_FILE_TOO_LARGE:
    "Media file is too large. Maximum size is of Image is 10MB and Video is 100MB.",
  IMAGE_FILE_TOO_LARGE: "Image file is too large. Maximum size is 10MB.",
  VIDEO_FILE_TOO_LARGE: "Video file is too large. Maximum size is 100MB.",
  TOO_MANY_IMAGES:
    "Too many media items. Maximum 10 media items allowed per upload.",
  GALLERY_PUBLIC_LIMIT_EXCEEDED:
    "Public gallery can have at most 10 media items.",
  GALLERY_PRIVATE_LIMIT_EXCEEDED:
    "Private gallery can have at most 10 media items.",
  NO_IMAGES_PROVIDED: "No images provided.",
  INVALID_IMAGE_URL: "Invalid image URL.",

  // Profile update messages
  PROFILE_UPDATED: "Profile updated successfully.",
  PROFILE_UPDATE_FAILED: "Failed to update profile",
  PROFILE_UPDATE_ERROR: "An error occurred while updating profile",
  PROFILE_FETCHED: "Profile fetched successfully.",
  PROFILE_FETCH_FAILED: "Failed to fetch profile",
  PROFILE_FETCH_ERROR: "An error occurred while fetching profile",

  // Time validation messages
  INVALID_TIME_FORMAT: "Invalid time format. Use HH:MM or HH:MM:SS",
  INVALID_START_TIME_FORMAT: "Invalid start_time format. Use HH:MM or HH:MM:SS",
  INVALID_END_TIME_FORMAT: "Invalid end_time format. Use HH:MM or HH:MM:SS",
  START_TIME_MUST_BE_BEFORE_END_TIME: "Start time must be before end time",

  // Tag messages
  TAG_NOT_FOUND_BY_ID: "Tag with ID {tagId} not found",
  TAG_ID_OR_LABEL_REQUIRED: "Either tag_id or tag_label must be provided",

  // User Rates messages
  USER_RATES_ONLY_FOR_ESCORT:
    "User rates can only be set for users with Escort role",
  RATE_MUST_HAVE_TYPE_DURATION_PRICE:
    "Each rate must have type, duration, and price",
  PRICE_MUST_BE_NON_NEGATIVE: "Price must be a non-negative number",

  // AWS S3 messages
  AWS_ENV_VARS_MISSING: "Missing required AWS environment variables: {missing}",
  INVALID_BUFFER_REQUIRED:
    "Invalid buffer: Buffer is required and must be a valid Buffer instance",
  INVALID_S3_KEY: "Invalid key: Key must be a non-empty string",
  INVALID_BUFFER_EMPTY: "Invalid buffer: Buffer cannot be empty",
  S3_UPLOAD_FAILED: "S3 upload failed: {errorMessage}. Key: {key}",
  S3_DELETE_FAILED: "S3 delete failed: {errorMessage}. Input: {input}",
  INVALID_S3_INPUT:
    "Invalid input: Input must be a non-empty string (key or URL)",
  INVALID_S3_URL_FORMAT:
    "Invalid S3 URL format: {url}. Expected format: https://bucket.s3.region.amazonaws.com/key",
  INVALID_S3_URL_EMPTY: "Invalid URL: fullUrl must be a non-empty string",
  INVALID_EXPIRES_IN:
    "Invalid expiresIn: Must be a number between 1 and 604800 (7 days)",
  INVALID_S3_URL_BASE:
    "Invalid S3 URL format: {fullUrl}. Expected to start with {baseUrl}",
  INVALID_S3_URL_KEY_EXTRACTION:
    "Invalid S3 URL: Could not extract key from URL: {fullUrl}",
  S3_SIGNED_URL_GENERATION_FAILED:
    "S3 signed URL generation failed: {errorMessage}. URL: {url}",

  // JWT messages
  JWT_SECRET_NOT_DEFINED: "JWT_SECRET is not defined in environment variables",

  // Upload middleware messages
  ONLY_IMAGE_VIDEO_ALLOWED: "Only image and video files are allowed",
  FILE_TOO_LARGE:
    "{fileType} file is too large. Maximum size is {maxSizeMB}MB.",

  // Contact Us messages
  CONTACT_US_CREATED: "Message sent successfully.",
};

export { MESSAGES };
