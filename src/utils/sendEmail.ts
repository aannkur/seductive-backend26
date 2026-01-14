import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Type definitions for email replacements
interface OTPReplacements {
  name: string;
  otp: string;
}

interface WelcomeEmailReplacements {
  name: string;
}

interface ContactUsReplacements {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  submittedAt?: string;
}

interface GenericReplacements {
  [key: string]: string | undefined;
}

// // Create a transporter using your email credential
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: parseInt(process.env.EMAIL_PORT || "587"), // or 465 for SSL te
  //secure: process.env.EMAIL_SECURE, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// // AWS SES Transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.AWS_SES_HOST as string,
//   port: parseInt(process.env.AWS_SES_PORT as string),
//   secure: false,
//   auth: {
//     user: process.env.AWS_SES_USER as string,
//     pass: process.env.AWS_SES_PASS as string,
//   },
// });

// Function to send a simple email (plain text)
const sendEmail = async (
  to: string,
  subject: string,
  text: string
): Promise<nodemailer.SentMessageInfo | undefined> => {
  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Optionally return the email information for logging or debugging
  } catch (error) {
    console.log(
      `Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Function to send an email with HTML content and optional attachments
const sendEmailOTP = async (
  to: string,
  subject: string,
  text: string,
  replacements: OTPReplacements
): Promise<nodemailer.SentMessageInfo | undefined> => {
  // Read the HTML template file
  const templatePath = path.join(
    __dirname,
    "../templates/reset-password-email.html"
  );
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const projectName = process.env.PROJECT_NAME;
  const companyAddress = process.env.COMPANY_ADDRESS;

  // Replace placeholders with actual values
  htmlTemplate = htmlTemplate.replace("{{name}}", replacements.name);
  htmlTemplate = htmlTemplate.replace("{{otp}}", replacements.otp);
  htmlTemplate = htmlTemplate.replace("{{projectName}}", projectName || "");
  htmlTemplate = htmlTemplate.replace(
    "{{companyAddress}}",
    companyAddress || ""
  );

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
    html: htmlTemplate, // Use the updated HTML content with replacements
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Optionally return the email information for logging or debugging
  } catch (error) {
    console.log(
      `Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Function to send a welcome email with OTP
const sendWelcomeEmailOTP = async (
  to: string,
  subject: string,
  text: string,
  replacements: OTPReplacements
): Promise<nodemailer.SentMessageInfo | undefined> => {
  // Read the HTML template file
  const templatePath = path.join(
    __dirname,
    "../templates/welcome-email-otp.html"
  );
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const pn = process.env.PROJECT_NAME;
  const companyAddress = process.env.COMPANY_ADDRESS;

  // Replace placeholders with actual values
  htmlTemplate = htmlTemplate.replace("{{name}}", replacements.name);
  htmlTemplate = htmlTemplate.replace("{{otp}}", replacements.otp);
  htmlTemplate = htmlTemplate.replace("{{pn}}", pn || "");
  htmlTemplate = htmlTemplate.replace(
    "{{companyAddress}}",
    companyAddress || ""
  );
  htmlTemplate = htmlTemplate.replace(
    "{{currentYear}}",
    new Date().getFullYear().toString()
  );

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
    html: htmlTemplate, // Use the updated HTML content with replacements
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Optionally return the email information for logging or debugging
  } catch (error) {
    console.log(
      `Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Function to send login OTP email
const loginSendEmailOtp = async (
  to: string,
  subject: string,
  text: string,
  replacements: OTPReplacements
): Promise<nodemailer.SentMessageInfo | undefined> => {
  // Read the HTML template file
  const templatePath = path.join(
    __dirname,
    "../templates/login-email-otp.html"
  );
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const pn = process.env.PROJECT_NAME;
  const companyAddress = process.env.COMPANY_ADDRESS;

  // Replace placeholders with actual values
  htmlTemplate = htmlTemplate.replace("{{name}}", replacements.name);
  htmlTemplate = htmlTemplate.replace("{{otp}}", replacements.otp);
  htmlTemplate = htmlTemplate.replace("{{pn}}", pn || "");
  htmlTemplate = htmlTemplate.replace(
    "{{companyAddress}}",
    companyAddress || ""
  );
  htmlTemplate = htmlTemplate.replace(
    "{{currentYear}}",
    new Date().getFullYear().toString()
  );

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
    html: htmlTemplate, // Use the updated HTML content with replacements
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Optionally return the email information for logging or debugging
  } catch (error) {
    console.log(
      `Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Function to send a welcome email with OTP
const welcomeEmail = async (
  to: string,
  subject: string,
  text: string,
  replacements: WelcomeEmailReplacements,
  type: string
): Promise<nodemailer.SentMessageInfo | undefined> => {
  // Read the HTML template file
  let templatePath = path.join(
    __dirname,
    "../templates/welcome-email-user.html"
  );

  if (type === "adv") {
    templatePath = path.join(
      __dirname,
      "../templates/welcome-email-advertiser.html"
    );
  }

  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const pn = process.env.PROJECT_NAME;
  const companyAddress = process.env.COMPANY_ADDRESS;

  // Replace placeholders with actual values
  htmlTemplate = htmlTemplate.replace("{{name}}", replacements.name);
  htmlTemplate = htmlTemplate.replace("{{pn}}", pn || "");
  htmlTemplate = htmlTemplate.replace(
    "{{companyAddress}}",
    companyAddress || ""
  );

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
    html: htmlTemplate, // Use the updated HTML content with replacements
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Optionally return the email information for logging or debugging
  } catch (error) {
    console.log(
      `Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// New Function for Sending Newsletter Emails
interface Subscriber {
  email: string;
}

const sendNewsletterEmail = async (
  subscribers: Subscriber[],
  subject: string,
  content: string
): Promise<
  { message: string; results: nodemailer.SentMessageInfo[] } | undefined
> => {
  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    subject,
    text: content, // Newsletter content
    // Optionally, use HTML email
    html: content, // You can include HTML content for richer formatting
  };

  try {
    // Sending email to each subscriber in the list
    const emailPromises = subscribers.map((subscriber) =>
      transporter.sendMail({ ...mailOptions, to: subscriber.email })
    );

    const results = await Promise.all(emailPromises); // Send emails concurrently
    return { message: "Newsletter sent successfully", results }; // Return success message and results
  } catch (error) {
    console.log(
      `Newsletter email sending: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

const sendContactUsEmail = async (
  to: string,
  subject: string,
  text: string,
  type: string,
  replacements: ContactUsReplacements
): Promise<nodemailer.SentMessageInfo | undefined> => {
  const templatePath = path.join(
    __dirname,
    `../templates/contact-us-${type}.html`
  );
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const pn = process.env.PROJECT_NAME;
  const companyAddress = process.env.COMPANY_ADDRESS;

  // Replace placeholders
  htmlTemplate = htmlTemplate
    .replace(/{{name}}/g, replacements.name || "")
    .replace(/{{email}}/g, replacements.email || "")
    .replace(/{{subject}}/g, replacements.subject || "")
    .replace(/{{message}}/g, replacements.message || "")
    .replace(/{{pn}}/g, pn || "")
    .replace(/{{submittedAt}}/g, replacements.submittedAt || "")
    .replace(/{{companyAddress}}/g, companyAddress || "");

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(
      `contact us email sending: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Send Email with PDF Attachment
const sendEmailWithAttachment = async (
  pdfFilePath: string,
  recipientEmail: string
): Promise<
  { message: string; info: nodemailer.SentMessageInfo } | undefined
> => {
  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to: recipientEmail,
    subject: "Transaction Receipt",
    text: "Please find the attached transaction receipt.",
    attachments: [
      {
        filename: pdfFilePath.split("/").pop(),
        path: pdfFilePath,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { message: "Email sent successfully", info };
  } catch (error) {
    console.log(
      `Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Function to send an email with HTML content and optional attachments
const sendEmailDispute = async (
  to: string,
  profile_name: string,
  title: string,
  description: string,
  name: string
): Promise<nodemailer.SentMessageInfo | undefined> => {
  const templatePath = path.join(__dirname, "../templates/dispute-email.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const projectName = process.env.PROJECT_NAME;
  const companyAddress = process.env.COMPANY_ADDRESS;

  // Replace placeholders with actual values
  htmlTemplate = htmlTemplate.replace("{{name}}", name);
  htmlTemplate = htmlTemplate.replace("{{profile_name}}", profile_name || "");
  htmlTemplate = htmlTemplate.replace("{{title}}", title || "");
  htmlTemplate = htmlTemplate.replace("{{description}}", description || "");
  htmlTemplate = htmlTemplate.replace("{{projectName}}", projectName || "");
  htmlTemplate = htmlTemplate.replace(
    "{{companyAddress}}",
    companyAddress || ""
  );

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject: `Dispute Notification - ${profile_name}`,
    text: `A dispute has been raised for the profile "${profile_name}".\n\nTitle: ${title}\nDescription: ${description}\n\nIf you believe this is a mistake, contact support.`,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(
      `dispute email sending: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Function to send a welcome email with OTP
const sendAdPostEmail = async (
  to: string,
  subject: string,
  text: string,
  replacements: GenericReplacements,
  templatePath: string
): Promise<nodemailer.SentMessageInfo | undefined> => {
  const fullPath = path.join(__dirname, templatePath);

  let htmlTemplate = fs.readFileSync(fullPath, "utf-8");

  // Add global defaults if missing
  replacements.pn = "Seductive Seekers";
  replacements.companyAddress = process.env.COMPANY_ADDRESS || "N/A";

  // Replace all {{placeholders}} in template
  htmlTemplate = htmlTemplate.replace(/{{(.*?)}}/g, (_, key) => {
    return replacements[key.trim()] ?? "";
  });

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(
      ` email sending: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Function to send a welcome email with OTP
const sendCMEmail = async (
  to: string,
  subject: string,
  text: string,
  replacements: GenericReplacements,
  templatePath: string
): Promise<nodemailer.SentMessageInfo | undefined> => {
  const fullPath = path.join(__dirname, templatePath);

  let htmlTemplate = fs.readFileSync(fullPath, "utf-8");

  // Add global defaults if missing
  replacements.pn = "Seductive Seekers";
  replacements.companyAddress = process.env.COMPANY_ADDRESS || "N/A";

  // Replace all {{placeholders}} in template
  htmlTemplate = htmlTemplate.replace(/{{(.*?)}}/g, (_, key) => {
    return replacements[key.trim()] ?? "";
  });

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(
      `email sending: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

// Function to send a welcome email with OTP
const sendCMSEmail = async (
  to: string,
  subject: string,
  text: string,
  replacements: WelcomeEmailReplacements,
  template: string
): Promise<nodemailer.SentMessageInfo | undefined> => {
  // Read the HTML template file
  const templatePath = path.join(__dirname, `${template}`);

  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const pn = process.env.PROJECT_NAME;
  const companyAddress = process.env.COMPANY_ADDRESS;

  // Replace placeholders with actual values
  htmlTemplate = htmlTemplate.replace("{{name}}", replacements.name);
  htmlTemplate = htmlTemplate.replace("{{pn}}", pn || "");
  htmlTemplate = htmlTemplate.replace(
    "{{companyAddress}}",
    companyAddress || ""
  );

  const mailOptions = {
    from: '"Seductive Seekers" <noreply@seductiveseekers.com>',
    to,
    subject,
    text,
    html: htmlTemplate, // Use the updated HTML content with replacements
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Optionally return the email information for logging or debugging
  } catch (error) {
    console.log(
      ` email sending: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
};

export {
  sendEmail,
  sendEmailOTP,
  sendWelcomeEmailOTP,
  loginSendEmailOtp,
  sendNewsletterEmail,
  sendEmailWithAttachment,
  sendEmailDispute,
  sendContactUsEmail,
  welcomeEmail,
  sendCMSEmail,
  sendAdPostEmail,
  sendCMEmail,
};
