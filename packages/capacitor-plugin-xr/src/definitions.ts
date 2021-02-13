declare module '@capacitor/core' {
  interface PluginRegistry {
    Example: ExamplePlugin;
  }
}

export interface ExamplePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
