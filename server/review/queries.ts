import uuidv4 from 'uuid/v4';

import { Thread, Visibility, ReviewNew, Pub } from 'server/models';
import { getLatestKeyInPubDraft } from 'server/utils/firebaseAdmin';

import {
	createCreatedThreadEvent,
	createClosedThreadEvent,
	createCompletedThreadEvent,
	createReleasedEvent,
} from '../threadEvent/queries';
import { createRelease } from '../release/queries';
import { createThreadComment } from '../threadComment/queries';

export const createReview = async (inputValues, userData) => {
	const { pubId, title, releaseRequested, review, text, content } = inputValues;
	const reviews = await ReviewNew.findAll({
		where: {
			pubId,
		},
		attributes: ['id', 'pubId', 'number'],
		raw: true,
	});
	const maxNumber = reviews.reduce((prev, curr) => {
		if (Number(curr.number) > prev) {
			return Number(curr.number);
		}
		return prev;
	}, 0);
	const threadId = uuidv4();
	const visibilityId = uuidv4();
	await Promise.all([
		Visibility.create({
			id: visibilityId,
			access: 'members',
		}),
		Thread.create({
			id: threadId,
		}),
	]);
	const reviewData = await ReviewNew.create({
		title: title || 'Publication Request',
		number: maxNumber + 1,
		releaseRequested,
		threadId,
		visibilityId,
		userId: userData.id,
		pubId,
		review,
	});

	await createCreatedThreadEvent(userData, threadId);
	if (text) {
		await createThreadComment({ threadId, content, text }, userData);
	}

	return reviewData;
};

export const createReviewRelease = async (inputValues, userData) => {
	const pubData = await Pub.findOne({
		where: { id: inputValues.pubId },
		attributes: ['id', 'slug'],
	});
	const latestKey = await getLatestKeyInPubDraft(inputValues.pubId);
	const updateResult = await ReviewNew.update(
		{ status: 'completed' },
		{
			where: { pubId: inputValues.pubId, threadId: inputValues.threadId },
		},
	);
	if (!updateResult[0]) {
		throw new Error('Invalid pubId or threadId');
	}
	const release = await createRelease({
		userId: userData.id,
		pubId: inputValues.pubId,
		historyKey: latestKey,
	});
	const releasedEvent = await createReleasedEvent(
		userData,
		inputValues.threadId,
		pubData.slug,
		release.id,
	);
	const completedEvent = await createCompletedThreadEvent(userData, inputValues.threadId);
	const reviewEvents = [releasedEvent, completedEvent];

	return { release, reviewEvents };
};

export const updateReview = async (inputValues, updatePermissions, userData) => {
	// Filter to only allow certain fields to be updated
	const filteredValues = {};
	Object.keys(inputValues).forEach((key) => {
		if (updatePermissions.includes(key)) {
			filteredValues[key] = inputValues[key];
		}
	});

	const previousReview = ReviewNew.findOne({
		where: { id: inputValues.reviewId },
		attributes: ['id', 'status'],
	});
	return ReviewNew.update(filteredValues, {
		where: { id: inputValues.reviewId },
		returning: true,
	})
		.then((updatedReview) => {
			if (!updatedReview[0]) {
				return {};
			}
			const nextValues = updatedReview[1][0].get();
			const prevStatus = previousReview.status;
			const wasClosed = prevStatus !== 'closed' && nextValues.status === 'closed';
			const wasCompleted = prevStatus !== 'completed' && nextValues.status === 'completed';
			if (wasClosed) {
				return Promise.all[createClosedThreadEvent(userData, nextValues.threadId)];
			}
			if (wasCompleted) {
				return Promise.all[createCompletedThreadEvent(userData, nextValues.threadId)];
			}
			return [];
		})
		.then((newReviewEvents) => {
			return { updatedValues: filteredValues, newReviewEvents };
		});
};

export const destroyReview = (inputValues) => {
	return ReviewNew.destroy({
		where: { id: inputValues.reviewId },
	});
};
