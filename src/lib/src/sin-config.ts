import {InjectionToken} from '@angular/core'
import {SinModuleConfig} from './interfaces'

export const SIN_CONFIG = new InjectionToken<Partial<SinModuleConfig>>('SIN_CONFIG')

export const SIN_FULL_CONFIG = new InjectionToken<SinModuleConfig>('SIN_FULL_CONFIG')
