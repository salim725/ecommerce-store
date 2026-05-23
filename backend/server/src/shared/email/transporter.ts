import nodemailer from 'nodemailer'

export const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

export const emailTemplate = (content: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #4F46E5;">
            <h1 style="color: #4F46E5; margin: 0;">🛍️ MyShop</h1>
        </div>
        <div style="padding: 30px 0;">
            ${content}
        </div>
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>© 2025 MyShop. All rights reserved.</p>
        </div>
    </div>
`
