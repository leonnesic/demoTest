import EntityManager from '../core/EntityManager';
import ComponentType from '../core/ComponentType';
import EventBus from '../utils/EventBus';


export default class DataFetcherSystem {
    /** Fetches remote data for the entity’s DataFetch component. */
    static async fetch(entityId: string): Promise<any> {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) throw new Error(`[DataFetcherSystem] Entity ${entityId} not found`);

        const fetchComp = entity.getComponent(ComponentType.DATAFETCH)

        if (fetchComp.loaded) {
            return fetchComp.result;
        }

        try {
            const response = await fetch(fetchComp.url);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);

            const data = await response.json();
            fetchComp.result = data;
            fetchComp.loaded = true;

            return data;
        } catch (err) {
            console.error(`[DataFetcherSystem] Failed to fetch data for entity ${entityId}:`, err);
            fetchComp.loaded = false;
            fetchComp.result = null;
            throw err;
        }
    }
}
