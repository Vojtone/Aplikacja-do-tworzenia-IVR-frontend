import { Component } from '@angular/core';
import { RouteConfig, RouterLink, Router } from '@angular/router-deprecated';

import { LoggedInRouterOutlet } from './LoggedInOutlet';
import { Home } from '../home/home';
import { Login } from '../login/login';
import { Signup } from '../signup/signup';
import { Project } from '../project/project';

let template = require('./app.html');

@Component({
  selector: 'my-app',
  template: template,
  directives: [ LoggedInRouterOutlet ],
  styleUrls: [ 'src/app.css' ]
})

@RouteConfig([
  { path: '/', redirectTo: ['/Home'] },
  { path: '/home/...', component: Home, as: 'Home' },
  { path: '/login', component: Login, as: 'Login' },
  { path: '/signup', component: Signup, as: 'Signup' },
  { path: '/project', component: Project, as: 'Project'}
])

export class App {
  constructor(public router: Router) {
  }
}
