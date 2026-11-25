export type Palette = {
  colors: Record<string, string>;
  themes: Record<string, { scheme: string; roles: Record<string, string> }>;
};

export declare const palette: Palette;
export declare function role(theme: string, name: string): string;
export declare const htmlColors: {
  groundLight: string;
  groundDark: string;
};
export declare function paletteCss(): string;
