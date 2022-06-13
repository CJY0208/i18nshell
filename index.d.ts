class EventBus<T = string> {
    private listeners;
    private getEventMap;
    on: (event: T, listener: Function, { once }?: {
        once?: boolean;
    }) => this;
    once: (event: T, listener: Function, config?: {}) => this;
    off: (event: T, listener: Function) => this;
    emit: (event: T, ...args: any[]) => void;
}

export interface I18nConfig {
    types: {
        resources: Record<string, any>;
    }[];
    defaultType?: string;
    fallback?: I18n[] | Record<string, any>;
}

export class I18n {
    static instances: I18n[];
    static lng: string;
    static eventBus: EventBus<string>;
    static template: (str: string, data: any = {}, options: { split?: boolean, fallback?: string } = {}) => string;
    static load: (...loaders: any[]) => Promise<any>;
    static applyLng: (lng: any) => Promise<void>;
    resources: Record<string, any>;
    lng: string;
    eventBus: EventBus<string>;
    config: I18nConfig;
    constructor(config: I18nConfig);
    applyLng: (lng: string) => Promise<void>;
    fT: (str: string, options: any, namespace: any) => any;
    t: (str: string, options?: {}) => any;
}

export default I18n
