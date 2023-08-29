import mailgun from 'mailgun.js';
import stripIndent from 'strip-indent';

const mg = mailgun.client({
	username: 'api',
	key: process.env.MAILGUN_API_KEY!,
});

type From = { name: string; address: string };
type Body = { text: string } | { html: string };

type SendEmailOptions = {
	from?: From;
	replyTo?: string;
	to: string[];
	cc?: string[];
	subject: string;
} & Body;

const defaultFrom: From = {
	name: 'PubPub Team',
	address: 'hello@pubpub.org',
};

export const sendEmail = (options: SendEmailOptions) => {
	const { from = defaultFrom, to, subject } = options;
	const body = 'text' in options ? { text: options.text } : { html: options.html };
	return mg.messages.create('mg.pubpub.org', {
		from: `${from.name} <${from.address}>`,
		to,
		subject,
		...('replyTo' in options && { 'h:Reply-To': options.replyTo }),
		...('cc' in options && { cc: options.cc }),
		...body,
	});
};

export const sendPasswordResetEmail = ({ toEmail, resetUrl }) => {
	// TODO: We should probably indicate the community somewhere.
	// e.g. 'We've received a request to reset your PubPub account on Responsive Science.'
	return mg.messages.create('mg.pubpub.org', {
		from: 'PubPub Team <hello@mg.pubpub.org>',
		to: [toEmail],
		subject: 'Password Reset · PubPub',
		text: stripIndent(`
			We've received a password reset request. Follow the link below to reset your password.

			${resetUrl}

			Sincerely,
			PubPub Support
		`),
		'h:Reply-To': 'hello@pubpub.org',
	});
};
