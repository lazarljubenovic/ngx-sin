import {AfterContentInit, ContentChildren, Directive, Input, OnInit, QueryList} from '@angular/core'
import {AbstractControl, ControlContainer} from '@angular/forms'
import {SinDirective} from './sin.directive'

@Directive({
  selector: '[ngxSins]',
})
export class SinsDirective implements OnInit, AfterContentInit {

  @Input('ngxSins') public name: string

  @ContentChildren(SinDirective)
  public sins: QueryList<SinDirective>

  private control: AbstractControl

  constructor(private container: ControlContainer) {
  }

  public ngOnInit(): void {
    this.control = this.container.control.get(this.name)
  }

  public ngAfterContentInit(): void {
    this.sins.forEach(sin => {
      sin.control = this.control
    })
  }

}
