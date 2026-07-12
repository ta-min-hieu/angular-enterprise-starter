export interface NavMenuItem {
  readonly label: string;
  readonly route: string;
  readonly icon?: string;
  readonly permission?: string;
  readonly children?: readonly NavMenuItem[];
}
