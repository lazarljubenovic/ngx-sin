import {ModuleWithProviders, NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {ReactiveFormsModule} from '@angular/forms'
import {SinDirective} from './sin.directive'
import {SIN_CONFIG, SIN_FULL_CONFIG} from './sin-config'
import {SinsDirective} from './sins.directive'
import {SinModuleConfig, WhenObject} from './interfaces'

export function when({dirty, touched}: Partial<WhenObject>) {
  return dirty && touched
}

export const defaultConfig = {
  when,
}

export function factory(config?: Partial<SinModuleConfig>): SinModuleConfig {
  return Object.assign({}, defaultConfig, config || {})
}

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    SinDirective,
    SinsDirective,
  ],
  exports: [
    SinDirective,
    SinsDirective,
  ],
})
export class SinModule {
  public static forRoot(config?: Partial<SinModuleConfig>): ModuleWithProviders {
    return {
      ngModule: SinModule,
      providers: [
        {
          provide: SIN_CONFIG,
          useValue: config,
        },
        {
          provide: SIN_FULL_CONFIG,
          useFactory: factory,
          deps: [SIN_CONFIG],
        },
      ],
    }
  }
}
