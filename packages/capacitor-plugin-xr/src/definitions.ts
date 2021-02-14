declare module '@capacitor/core' {
  interface PluginRegistry {
    XRPlugin: ExamplePlugin;
  }
}

export interface ExamplePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
