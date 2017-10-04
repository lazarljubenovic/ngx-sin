import {ModuleWithProviders, NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {ReactiveFormsModule} from '@angular/forms'
import {SinDirective} from './sin.directive'
import {SIN_CONFIG} from './sin-config'
import {SinsDirective} from './sins.directive'
import {SinModuleConfig} from './interfaces'

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
          useValue: {
            ...{
              when: function DEFAULT_WHEN_FN({dirty, touched}: any) {
                return dirty && touched
              },
            }, ...(config || {})
          },
        },
      ],
    }
  }
}
