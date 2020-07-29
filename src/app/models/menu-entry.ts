import { SafeStyle } from '@angular/platform-browser';

export interface MenuEntry {
    parent: string;
    displayName: string;
    routerLink: unknown[];
    disabled?: boolean;
    completed?: boolean;
    progress?: SafeStyle;
}
