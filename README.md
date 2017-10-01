# Sin

> **sin**
> 1. an immoral act considered to be a transgression against divine law.
> 2. to offend against a principle, standard, etc.
> 3. a shorter synonym for _error_ to make Angular templates less bloated

## Features

- Less bloat in templates when displaying errors.
- Globally configurable rule for _when_ should an error appear.
- Embraces reactive forms.

## Installation

```
# with npm
npm i ngx-sin

# with yarn
yarn ngx-sin
```

## Example usage

```typescript
form = this.fb.group({
  username: ['', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(16),
  ]],
  email: ['', [
    Validators.required,
    Validators.email,
  ]],
  password: ['', [
    Validators.required,
    Validators.minLength(4),
  ]],
})
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">

  <div>
    <label>
      <span>Username</span>
      <input type="text" formControlName="username">
    </label>
    <div ngxSins="username">
      <div *ngxSin="'required'">Username is required</div>
      <div *ngxSin="'minlength'">Username must be at least 2 characters long</div>
      <div *ngxSin="'maxlength'">Username must be at most 16 characters long</div>
      <div *ngxSin="'serverError'; let msg">{{ msg }}</div>
    </div>
  </div>

  <div>
    <label>
      <span>Email</span>
      <input type="email" formControlName="email">
    </label>
    <div ngxSins="email">
      <div *ngxSin="'required'">Email is required</div>
      <div *ngxSin="'email'">Your email seems invalid</div>
      <div *ngxSin="'serverError'; let msg">{{ msg }}</div>
    </div>
  </div>

  <div>
    <label>
      <span>Password</span>
      <input type="password" formControlName="password">
    </label>
    <div ngxSins="password">
      <div *ngxSin="'required'">Password is required</div>
      <div *ngxSin="'minlength'">What kind of short password is that?!</div>
      <div *ngxSin="'serverError'; let msg">{{ msg }}</div>
    </div>
  </div>

  <button type="submit">Register</button>

</form>
```
