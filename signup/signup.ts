import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router-deprecated';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';

let template = require('./signup.html');

@Component({
  selector: 'signup',
  directives: [ RouterLink, CORE_DIRECTIVES, FORM_DIRECTIVES ],
  template: template
})

export class Signup {

  error: string;
  json_errors;
  errors: string;

  constructor(public router: Router, public http: Http) {
    localStorage.removeItem('signup_info');
    localStorage.removeItem('delete_account_info');
  }

  signup(event, email, password, password_confirmation) {
    event.preventDefault();
    let body = JSON.stringify({ email, password, password_confirmation });
    this.http.post('http://localhost:3001/users', body, { headers: contentHeaders })
      .subscribe(
        response => {
          this.router.parent.navigateByUrl('/login');
          localStorage.setItem('signup_info',
          'Rejestracja przebiegła pomyślnie. Proszę się zalogować.');
        },
        error => {
          this.json_errors = JSON.parse(error._body).errors;
          this.error = JSON.stringify((this.json_errors));

          this.errors = this.error.replace( /[,'""\[|\]]/g, '' );

          this.errors = this.errors.replace('password cant be blank', 'Wprowadź hasło. ');
          this.errors = this.errors.replace('email is invalid', 'Niepoprawny e-mail. ');
          this.errors = this.errors.replace('password_confirmation cant be blank',
          'Potwierdź hasło. ');
          this.errors = this.errors.replace('password_confirmation doesnt match Password',
          'Hasła się różnią. ');
          this.errors = this.errors.replace('email has already been taken',
          'Adres e-mail jest zajęty. ');

          console.log(JSON.stringify(error));
        }
      );
  }

  login(event) {
    event.preventDefault();
    this.router.parent.navigateByUrl('/login');
  }

}
