import { marked } from "marked";
import nodemailer from "nodemailer";
import { getEnv } from "../utils/getEnv";

interface EmailToSend {
	subject: string;
	body: string;
	to: string;
}

const EMAIL_HOST = getEnv("EMAIL_HOST");
const EMAIL_PORT = getEnv("EMAIL_PORT");
const EMAIL_USER = getEnv("EMAIL_USER");
const EMAIL_PASSWORD = getEnv("EMAIL_PASSWORD");

export class EmailClient {
	private static instance: EmailClient;
	private constructor() {}

	static getInstance() {
		if (!EmailClient.instance) {
			EmailClient.instance = new EmailClient();
		}
		return EmailClient.instance;
	}

	async sendEmail(email: EmailToSend) {
		const { subject, body, to } = email;
		const transporter = nodemailer.createTransport({
			host: EMAIL_HOST,
			port: parseInt(EMAIL_PORT),
			secure: false,
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASSWORD,
			},
		});
		const html = await marked(body);
		await transporter.sendMail({
			from: `"Assistente de IA" <${EMAIL_USER}>`,
			to, // list of receivers
			subject, // Subject line
			html, // plain text body
		});
	}
}
