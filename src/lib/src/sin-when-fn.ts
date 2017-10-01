import {InjectionToken} from '@angular/core'
import {WhenFunction} from './interfaces'

export const SIN_CONFIG = new InjectionToken<WhenFunction>('SIN_WHEN_FN')
