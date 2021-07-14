import { defer } from 'server/utils/deferred';

type CreateActivityHooksOptions<Model> = {
	Model: any;
	onModelCreated?: (actorId: null | string, modelId: string) => Promise<void>;
	onModelUpdated?: (
		actorId: null | string,
		modelId: string,
		previousModel: Model,
	) => Promise<void>;
	onModelDestroyed?: (actorId: null | string, modelId: string) => Promise<void>;
};

export const createActivityHooks = <Model>(options: CreateActivityHooksOptions<Model>) => {
	const { Model, onModelCreated, onModelUpdated, onModelDestroyed } = options;
	if (onModelCreated) {
		Model.afterCreate((model, { actorId }) => defer(() => onModelCreated(actorId, model.id)));
	}
	if (onModelUpdated) {
		Model.afterUpdate((model, { actorId }) =>
			defer(() => onModelUpdated(actorId, model.id, model._previousDataValues)),
		);
	}
	if (onModelDestroyed) {
		Model.beforeDestroy(async (model, { actorId }) => {
			await onModelDestroyed(actorId, model.id);
		});
	}
};
