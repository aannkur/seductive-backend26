import ContactUs from "../models/contact-us.model"
import { sendContactUsEmail } from "../utils/sendEmail";

interface ContactUsPayload {
    full_name: string,
    email: string,
    help_topic: string,
    message: string,
}

export const createContactUsService = async (payload: ContactUsPayload) => {

    const contact = ContactUs.create(payload)

    const submittedAt = new Date().toLocaleString();

    // Email to Admin 
    try {
        await sendContactUsEmail(
            process.env.ADMIN_EMAIL || "support@seductiveseekers.com", // to
            "New Contact Us Message",                                 // subject
            "A new message has been submitted.",                      // text
            'admin',                                                  // type: template type
            {                                                         // Dynamic payload
                name: payload.full_name,
                email: payload.email,
                subject: payload.help_topic,
                message: payload.message,
                submittedAt,
            }
        )
    } catch (error) {
        console.log("Admin contact email failed",error)
    }

    // Confirmation Email to User
    try {
        await sendContactUsEmail(
            payload.email,                                             // to
            `We received your message - ${process.env.PROJECT_NAME}`,  // subject
            'Thank you for contacting us!',                            // text
            'user',                                                    // type: template type
            {                                                          // Dynamic payload
                name: payload.full_name,
                email: payload.email,
                subject: payload.help_topic,
                message: payload.message,
                submittedAt,
            }

        )
    } catch (error) {
        console.log("User contact email failed",error)
    }
    return contact;
}