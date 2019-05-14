import React from 'react';
import PropTypes from 'prop-types';
import { apiFetch } from 'utils';
import queryString from 'query-string';
import { initFirebase } from 'utils/firebaseClient';

const propTypes = {
	pubData: PropTypes.object.isRequired,
	children: PropTypes.func.isRequired,
	locationData: PropTypes.object.isRequired,
};

const fetchVersionFromHistory = (pubData, historyKey, accessHash) =>
	apiFetch(
		'/api/pubHistory?' +
			queryString.stringify({
				pubId: pubData.id,
				communityId: pubData.communityId,
				branchId: pubData.activeBranch.id,
				historyKey: historyKey,
				accessHash: accessHash,
			}),
	);

class PubSyncManager extends React.Component {
	constructor(props) {
		super(props);
		const { historyData } = this.props.pubData;
		this.state = {
			firebaseRootRef: undefined,
			firebaseBranchRef: undefined,
			pubData: this.props.pubData,
			collabData: {
				editorChangeObject: {},
				status: 'connecting',
			},
			historyData: historyData,
		};
		this.syncMetadata = this.syncMetadata.bind(this);
		this.updatePubData = this.updatePubData.bind(this);
		this.updateCollabData = this.updateCollabData.bind(this);
		this.updateLocalData = this.updateLocalData.bind(this);
	}

	componentDidMount() {
		const rootKey = `pub-${this.props.pubData.id}`;
		const branchKey = `branch-${this.props.pubData.activeBranch.id}`;
		initFirebase(rootKey, this.props.pubData.firebaseToken).then(([rootRef, connectionRef]) => {
			this.setState({
				firebaseRootRef: rootRef,
				firebaseBranchRef: rootRef.child(branchKey),
			});

			this.state.firebaseRootRef.child('metadata').on('child_changed', this.syncMetadata);

			connectionRef.on('value', (snapshot) => {
				if (snapshot.val() === true) {
					this.updateLocalData('collab', { status: 'connected' });
				} else {
					this.updateLocalData('collab', { status: 'disconnected' });
				}
			});
		});
	}

	componentWillUnmount() {
		if (this.state.firebaseRootRef) {
			this.state.firebaseRootRef.child('metadata').off('child_changed', this.syncMetadata);
		}
	}

	syncMetadata(snapshot) {
		this.setState((prevState) => {
			/* Firebase erases empty arrays, so empty arrays we sync up have */
			/* to be manually reconstructed here */
			let newVal = snapshot.val();
			if (snapshot.key === 'branches') {
				newVal = newVal.map((branch) => {
					return {
						...branch,
						permissions: branch.permissions || [],
					};
				});
			}

			return {
				pubData: {
					...prevState.pubData,
					[snapshot.key]: newVal,
				},
			};
		});
	}

	updatePubData(newPubData) {
		/* First, set the local state. */
		/* Then, sync appropriate data to firebase. */
		/* Other clients will receive updates which */
		/* triggers the syncMetadata function. */
		this.setState(
			(prevState) => {
				return {
					pubData: {
						...prevState.pubData,
						...newPubData,
					},
				};
			},
			() => {
				const keysToSync = [
					'attributions',
					'avatar',
					'branches',
					'citationData',
					'description',
					'discussions',
					'doi',
					'downloads',
					'isCommunityAdminManaged',
					'labels',
					'managers',
					'pubTags',
					'slug',
					'title',
					'useHeaderImage',
				];
				const firebaseSyncData = {};
				keysToSync.forEach((key) => {
					if (key in newPubData) {
						firebaseSyncData[key] = newPubData[key];
					}
				});
				const hasUpdates = Object.keys(firebaseSyncData).length;
				if (this.state.firebaseRootRef && hasUpdates) {
					this.state.firebaseRootRef.child('metadata').update(firebaseSyncData);
				}
			},
		);
	}

	updateCollabData(newCollabData) {
		this.setState((prevState) => {
			return {
				collabData: {
					...prevState.collabData,
					...newCollabData,
				},
			};
		});
	}

	updateHistoryData(newHistoryData) {
		const { pubData, locationData } = this.props;
		const { historyData: prevHistoryData } = this.state;
		this.setState(
			{
				historyData: {
					...prevHistoryData,
					...newHistoryData,
				},
			},
			() => {
				const { historyData: nextHistoryData } = this.state;
				if (prevHistoryData.currentKey !== nextHistoryData.currentKey) {
					// First, check to see whether we have an editorChangeObject corresponding to
					// the most recent document. If so, we don't need to do a fetch from the server
					// for this version, because we already have it stored locally.
					const {
						collabData: { editorChangeObject },
					} = this.state;
					const currentCollabDoc =
						editorChangeObject &&
						editorChangeObject.view &&
						editorChangeObject.view.state &&
						editorChangeObject.view.state.doc;
					if (
						nextHistoryData.currentKey === nextHistoryData.latestKey &&
						currentCollabDoc
					) {
						this.setState((state) => ({
							historyData: {
								...state.historyData,
								historyDoc: currentCollabDoc.toJSON(),
								historyDocKey: `history-${nextHistoryData.currentKey}`,
								timestamps: {
									...state.historyData.timestamps,
									[nextHistoryData.currentKey]: Date.now(),
								},
							},
						}));
					} else {
						// The new state wants a document from somewhere in the history other than
						// the most recent version. We'll have to fetch that with the API.
						fetchVersionFromHistory(
							pubData,
							newHistoryData.currentKey,
							locationData.query.access,
						).then(({ content, historyData: updatedHistoryData }) => {
							this.setState((state) => ({
								historyData: {
									...state.historyData,
									...updatedHistoryData,
									historyDoc: content,
									historyDocKey: `history-${nextHistoryData.currentKey}`,
									timestamps: {
										...state.historyData.timestamps,
										...updatedHistoryData.timestamps,
									},
								},
							}));
						});
					}
				}
			},
		);
	}

	updateLocalData(type, data) {
		if (type === 'pub') {
			this.updatePubData(data);
		}
		if (type === 'collab') {
			this.updateCollabData(data);
		}
		if (type === 'history') {
			this.updateHistoryData(data);
		}
	}

	render() {
		return this.props.children({
			pubData: this.state.pubData,
			collabData: this.state.collabData,
			historyData: this.state.historyData,
			firebaseBranchRef: this.state.firebaseBranchRef,
			updateLocalData: this.updateLocalData,
		});
	}
}

PubSyncManager.propTypes = propTypes;
export default PubSyncManager;
