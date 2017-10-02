export interface WhenObject {
  valid: boolean
  invalid: boolean
  pending: boolean
  enabled: boolean
  disabled: boolean
  pristine: boolean
  dirty: boolean
  touched: boolean
  untouched: boolean
}

export type WhenFunction = (whenObj: Partial<WhenObject>) => boolean;
