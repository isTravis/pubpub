import { generateHash } from 'utils/hashes';
import { Signup, User } from 'server/models';
import { sequelize } from 'server/sequelize';
import { sendSignupEmail } from 'server/utils/email';

export const createSignup = (inputValues, hostname) => {
	const email = inputValues.email.toLowerCase().trim();
	/* First, try to update the emailSentCount. */
	/* If there are no records to update, then we create a new one. */
	/* If this fails, it is because the email must be unique and it is already used */
	return User.findOne({
		where: { email },
	})
		.then((userData) => {
			if (userData) {
				throw new Error('Email already used');
			}

			return Signup.update(
				{ count: sequelize.literal('count + 1') },
				{
					where: { email, completed: false },
				},
			);
		})
		.then((updateCount) => {
			if (updateCount[0]) {
				return null;
			}
			return Signup.create({
				email,
				hash: generateHash(),
				count: 1,
				completed: false,
				communityId: inputValues.communityId,
			});
		})
		.then(() => {
			return Signup.findOne({ where: { email } });
		})
		.then((signUpData) => {
			return sendSignupEmail({
				toEmail: signUpData.email,
				signupUrl: `https://${hostname}/user/create/${signUpData.hash}`,
			});
		});
};
