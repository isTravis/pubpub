export const groupThreadsByLine = (decorations, threads) => {
	const sortedDecorations = decorations.sort((foo, bar) => {
		if (foo.boundingBox.bottom < bar.boundingBox.bottom) {
			return -1;
		}
		if (foo.boundingBox.bottom > bar.boundingBox.bottom) {
			return 1;
		}
		return 0;
	});
	let lastBottom;
	const discussionBottoms = {};
	sortedDecorations
		.filter((decoration) => {
			return (
				decoration.attrs &&
				decoration.attrs.class &&
				(decoration.attrs.class.indexOf('discussion-range') > -1 ||
					decoration.attrs.class.indexOf('local-highlight') > -1)
			);
		})
		.forEach((decoration) => {
			const currentBottom = decoration.boundingBox.bottom;
			if (lastBottom === currentBottom) {
				discussionBottoms[lastBottom].push(decoration);
				return null;
			}
			lastBottom = currentBottom;
			discussionBottoms[currentBottom] = [decoration];
			return null;
		});

	const groupings = [];
	Object.keys(discussionBottoms)
		.sort((foo, bar) => {
			if (Number(foo) < Number(bar)) {
				return -1;
			}
			if (Number(foo) > Number(bar)) {
				return 1;
			}
			return 0;
		})
		.forEach((bottomKey) => {
			const conatainedThreads = discussionBottoms[bottomKey]
				.sort((foo, bar) => {
					if (foo.boundingBox.left < bar.boundingBox.left) {
						return -1;
					}
					if (foo.boundingBox.left > bar.boundingBox.left) {
						return 1;
					}
					return 0;
				})
				.map((decoration) => {
					const newDiscussionId = decoration.attrs.class.replace(
						'local-highlight lh-',
						'',
					);
					const id = decoration.attrs.class.replace('discussion-range d-', '');
					const decorationThread = threads.find((thread) => {
						return thread[0].id === id;
					});
					const newThread = [{ id: newDiscussionId }];
					return decorationThread || newThread;
				});

			/* Find the right-most id, and use that as the mount point */
			/* for a group, so we don't break in the middle of a line. */
			const mountDiscussion = discussionBottoms[bottomKey].reduce((prev, curr) => {
				if (!prev) {
					return curr;
				}
				if (curr.boundingBox.right > prev.boundingBox.right) {
					return curr;
				}
				return prev;
			}, undefined);

			const mountClassName =
				mountDiscussion.attrs.class.indexOf('discussion-range d-') > -1
					? mountDiscussion.attrs.class.replace('discussion-range d-', 'dm-')
					: mountDiscussion.attrs.class.replace('local-highlight lh-', 'lm-');

			groupings.push({
				key: bottomKey,
				mountClassName: mountClassName,
				threads: conatainedThreads,
			});
		});
	return groupings;
};

export const nestDiscussionsToThreads = function(discussions) {
	const maxThreadNumber = discussions.reduce((prev, curr) => {
		if (curr.threadNumber > prev) {
			return curr.threadNumber;
		}
		return prev;
	}, 0);

	const tempThreads = new Array(maxThreadNumber).fill([]);
	discussions.forEach((item) => {
		tempThreads[item.threadNumber - 1] = [...tempThreads[item.threadNumber - 1], item];
	});

	return tempThreads
		.filter((thread) => {
			return thread.length;
		})
		.map((thread) => {
			return thread.sort((foo, bar) => {
				if (foo.createdAt > bar.createdAt) {
					return 1;
				}
				if (foo.createdAt < bar.createdAt) {
					return -1;
				}
				return 0;
			});
		});
};
