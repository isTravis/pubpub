import {Step} from 'prosemirror/dist/transform';
import {schema as pubSchema} from '../proseEditor/schema';
export class ModCollabDocChanges {
	constructor(mod) {
		mod.docChanges = this;
		this.mod = mod;

		this.unconfirmedSteps = {};
		this.confirmStepsRequestCounter = 0;
		this.awaitingDiffResponse = false;
		this.receiving = false;
		this.currentlyCheckingVersion = false;
	}

	checkHash(version, hash) {
		if (version === this.mod.editor.pm.mod.collab.version) {
			if (hash === this.mod.editor.getHash()) {
				return true;
			}
			this.disableDiffSending();
			this.mod.editor.askForDocument();
			return false;
		}
		this.checkDiffVersion();
		return false;
	}

	cancelCurrentlyCheckingVersion() {
		this.currentlyCheckingVersion = false;
		window.clearTimeout(this.enableCheckDiffVersion);
	}

	checkDiffVersion() {
		const that = this;
		if (this.currentlyCheckingVersion) {
			return;
		}
		this.currentlyCheckingVersion = true;
		this.enableCheckDiffVersion = window.setTimeout(function() {
			that.currentlyCheckingVersion = false;
		}, 1000);
		if (this.mod.editor.mod.serverCommunications.connected) {
			this.disableDiffSending();
		}
		this.mod.editor.mod.serverCommunications.send({
			type: 'check_diff_version',
			diff_version: this.mod.editor.pm.mod.collab.version
		});
	}

	disableDiffSending() {
		const that = this;
		this.awaitingDiffResponse = true;
		// If no answer has been received from the server within 2 seconds, check the version
		this.checkDiffVersionTimer = window.setTimeout(function() {
			that.awaitingDiffResponse = false;
			that.sendToCollaborators();
			that.checkDiffVersion();
		}, 2000);
	}

	enableDiffSending() {
		window.clearTimeout(this.checkDiffVersionTimer);
		this.awaitingDiffResponse = false;
		this.sendToCollaborators();
	}

	sendToCollaborators() {
		if (this.awaitingDiffResponse ||
			!this.mod.editor.pm.mod.collab.hasSendableSteps() ) {
			// this.mod.editor.mod.comments.store.unsentEvents().length === 0) {
			// We are waiting for the confirmation of previous steps, so don't
			// send anything now, or there is nothing to send.
			return;
		}

		const toSend = this.mod.editor.pm.mod.collab.sendableSteps();
		// const fnToSend = this.mod.editor.mod.footnotes.fnPm.mod.collab.sendableSteps()
		const requestId = this.confirmStepsRequestCounter++;
		const aPackage = {
			type: 'diff',
			diff_version: this.mod.editor.pm.mod.collab.version,
			diff: toSend.steps.map(sIndex => {
				const step = sIndex.toJSON();
				step.client_id = this.mod.editor.pm.mod.collab.clientID;
				return step;
			}),
			// footnote_diff: fnToSend.steps.map(s => {
			//     let step = s.toJSON()
			//     step.client_id = this.mod.editor.mod.footnotes.fnPm.mod.collab.clientID
			//     return step
			// }),
			// comments: this.mod.editor.mod.comments.store.unsentEvents(),
			// comment_version: this.mod.editor.mod.comments.store.version,
			request_id: requestId,
			hash: this.mod.editor.getHash(),
			token: this.mod.editor.token,
		};
		this.mod.editor.mod.serverCommunications.send(aPackage);
		this.unconfirmedSteps[requestId] = {
			diffs: toSend.steps,
			// footnote_diffs: fnToSend.steps,
			// comments: this.mod.editor.mod.comments.store.hasUnsentEvents()
		};
		this.disableDiffSending();
	}

	receiveFromCollaborators(data) {
		const that = this;
		if (this.mod.editor.waitingForDocument) {
			// We are currently waiting for a complete editor update, so
			// don't deal with incoming diffs.
			return undefined;
		}
		const editorHash = this.mod.editor.getHash();
		if (data.diff_version !== this.mod.editor.pm.mod.collab.version) {

			this.checkDiffVersion();
			return undefined;
		}

		if (data.hash && data.hash !== editorHash) {
			return false;
		}
		/*
		if (data.comments && data.comments.length) {
			this.mod.editor.updateComments(data.comments, data.comments_version)
		}
		*/
		if (data.diff && data.diff.length) {
			data.diff.forEach(function(diff) {
				that.applyDiff(diff);
			});
		}
		/*
		if (data.footnote_diff && data.footnote_diff.length) {
			this.mod.editor.mod.footnotes.fnEditor.applyDiffs(data.footnote_diff)
		  }
	  */
		if (data.reject_request_id) {
			this.rejectDiff(data.reject_request_id);
		}
		if (!data.hash) {
			// No hash means this must have been created server side.
			this.cancelCurrentlyCheckingVersion();
			this.enableDiffSending();
			// Because the uypdate came directly from the sevrer, we may
			// also have lost some collab updates to the footnote table.
			// Re-render the footnote table if needed.
			// this.mod.editor.mod.footnotes.fnEditor.renderAllFootnotes()
		}
	}

	confirmDiff(requestId) {
		const that = this;
		const sentSteps = this.unconfirmedSteps[requestId].diffs;
		this.mod.editor.pm.mod.collab.receive(sentSteps, sentSteps.map(function(step) {
			return that.mod.editor.pm.mod.collab.clientID;
		}));

		// let sentFnSteps = this.unconfirmedSteps[requestId]["footnote_diffs"]
		// this.mod.editor.mod.footnotes.fnPm.mod.collab.receive(sentFnSteps, sentFnSteps.map(function(step){
		//     return that.mod.editor.mod.footnotes.fnPm.mod.collab.clientID
		// }))

		// let sentComments = this.unconfirmedSteps[requestId]["comments"]
		// this.mod.editor.mod.comments.store.eventsSent(sentComments)

		delete this.unconfirmedSteps[requestId];
		this.enableDiffSending();
	}

	rejectDiff(requestId) {
		this.enableDiffSending();
		delete this.unconfirmedSteps[requestId];
		this.sendToCollaborators();
	}

	applyDiff(diff) {
		this.receiving = true;
		const steps = [diff].map(jIndex => Step.fromJSON(pubSchema, jIndex));
		const clientIds = [diff].map(jIndex => jIndex.client_id);
		this.mod.editor.pm.mod.collab.receive(steps, clientIds);
		this.receiving = false;
	}


}
