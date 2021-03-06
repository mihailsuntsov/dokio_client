// В добавление к использованию AuthService для работы с Observable -объектами, также вызываются методы 
// TokenStorageService для сохранения токена, имени пользователя и прав
/*
В ngOnInit() при загрузке проверяется, есть ли токен в tokenStorage, если есть,
то редиректимся в dashboard, если нет - остаемся на странице логина.
По onSubmit() данные формы с логином и паролем отправляются в AuthService, и сабскрайбимся на результат, в котором
при успешной авторизации прийдет:
accessToken - JWT-ключ. 
username - логин пользователя в системе 
authorities - набор прав 
Затем вызывается метод  reloadPage(), который перезагружает страницу
*/
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { DelCookiesService } from '../services/del-cookies.service';
import { TokenStorageService } from '../auth/token-storage.service';// TokenStorageService используется для управления токеном в sessionStorage браузера
import { Router } from '@angular/router';
import {  Validators, FormGroup, FormControl } from '@angular/forms';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [DelCookiesService]
})
export class LoginComponent implements OnInit {
  loginform: any ;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  emptyLogin=false;
  emptyPassword=false;

  constructor(
    private authService: AuthService, 
    private tokenStorage: TokenStorageService,
    private _router:Router,
    // private Cookie: Cookie,
    private delCookiesService: DelCookiesService,) { }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getAuthorities();
      this.roles.forEach(m=>{
      });
      // console.log("Token="+this.tokenStorage.getToken);
      // console.log("Username="+this.tokenStorage.getUsername);
      this.goToHomePage();
    } else {
      
      this.loginform = new FormGroup({
        username: new FormControl ('',[Validators.required,Validators.minLength(6)]),
        password: new FormControl ('',[Validators.required]),
      });
      this.delCookiesService.delCookiesOnLogin();
      Cookie.deleteAll();
    }

  }

  onSubmit() {
    if((this.loginform.get("username").value!="") && (this.loginform.get("password").value!="")){
      this.authService.attemptAuth(this.loginform.value).subscribe(//отправляем в authService форму целиком
        data => {
          console.log("data.accessToken ="+data.accessToken);
          this.tokenStorage.saveToken(data.accessToken);
          this.tokenStorage.saveUsername(data.username);
          this.tokenStorage.saveAuthorities(data.authorities);
           Cookie.set('dokio_token',data.accessToken, 1000 * 60 * 60 * 24,'/');
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          this.roles = this.tokenStorage.getAuthorities();
           this.reloadPage();
        },
        error => {
          console.log(error);
          if (error.error.message=="Error -> Unauthorized"){
            this.errorMessage = "Неправильные логин или пароль."
          }else{this.errorMessage = error.error.message;}
          this.isLoginFailed = true;
        }
      );
    }else{
      if(this.loginform.get("username").value==""){
        this.emptyLogin=true;
        console.log("empty login");
      }
      if(this.loginform.get("password").value==""){
        this.emptyPassword=true;
      }
    }
  }
  
  reloadPage() {
    window.location.reload();
    
  }
  goToHomePage() {
    this._router.navigate(['ui/dashboard'])
  }
}
