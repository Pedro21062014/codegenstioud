// Global type declarations

declare global {
    interface Window {
        electronAPI?: {
            platform: string;
            getVersion: () => Promise<string>;
            selectFile: () => Promise<string>;
            selectFolder: () => Promise<string>;
            saveFile: (data: any, filename: string) => Promise<string>;
            minimizeWindow: () => Promise<void>;
            maximizeWindow: () => Promise<void>;
            closeWindow: () => Promise<void>;
            getSystemInfo: () => Promise<any>;
            invoke: (channel: string, ...args: any[]) => Promise<any>;
        };
        Stripe: any;
    }
}

export { };
