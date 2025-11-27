import Contact from '../models/Contact.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Send email notification (if configured)
    if (process.env.EMAIL_USER) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `New Contact Form: ${subject || 'No Subject'}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
