import {ModuleWithProviders, NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {ReactiveFormsModule} from '@angular/forms'
import {SinDirective} from './sin.directive'
import {SIN_CONFIG} from './sin-when-fn'
import {SinsDirective} from './wrap.directive'
import {WhenFunction} from './interfaces'

export interface SinModuleConfig {
  when: WhenFunction;
}

export function DEFAULT_WHEN_FN({dirty, touched}: any) {
  return dirty && touched
}

export const DEFAULT: SinModuleConfig = {
  when: DEFAULT_WHEN_FN,
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
  public static forRoot(config?: SinModuleConfig): ModuleWithProviders {
    return {
      ngModule: SinModule,
      providers: [
        {
          provide: SIN_CONFIG,
          useValue: {...DEFAULT, ...(config || {})},
        },
      ],
    }
  }
}
