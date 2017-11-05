import { Component } from '@angular/core';
import { RouteConfig, Router, RouterLink } from '@angular/router-deprecated';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { Http, Headers } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { AuthHttp } from 'angular2-jwt';
import { contentHeader_content_type } from '../common/header_content_type';


let template = require('./changepassword.html');

@Component({
    selector: 'changepassword',
    directives: [ RouterLink, CORE_DIRECTIVES, FORM_DIRECTIVES ],
    template: template
})

export class Changepassword {

  error: string;
  json_errors;
  errors: string;
  user_address: string;

  constructor(public router: Router, public authHttp: AuthHttp) {
    localStorage.removeItem('change_password_info');
    localStorage.removeItem('delete_project_info');
    this.user_address = localStorage.getItem('user_address');
  }

  change_password(event, old_password, password, password_confirmation) {
    event.preventDefault();
    let body = JSON.stringify({ old_password, password, password_confirmation });
    this.authHttp.patch(this.user_address, body, { headers: contentHeader_content_type })
      .subscribe(
        response => {
          this.router.parent.navigateByUrl('/home/project_list');
          localStorage.setItem('change_password_info', 'Hasło zostało zmienione');
        },
        error => {

          this.json_errors = JSON.parse(error._body).errors;
          console.log(this.json_errors);
          this.error = JSON.stringify((this.json_errors));
          this.errors = this.error.replace( /[,'""\[|\]]/g, '' );

          this.errors = this.errors.replace('', 'Wprowadzone stare hasło jest nieprawidłowe. ');
          this.errors = this.errors.replace('password_confirmation doesnt match Password',
          'Podane nowe hasła się różnią. ');
          this.errors = this.errors.replace(
          'Wprowadzone stare hasło jest nieprawidłowe. Podane nowe hasła się różnią. ',
          'Wprowadzone stare hasło jest nieprawidłowe. ');

          console.log(JSON.stringify(error));
        }
      );
  }
}
