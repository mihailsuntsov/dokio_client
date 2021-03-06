// Сервис реализует интеграцию ККМ АТОЛ (платформа 5, драйвер 10.x) с Докио через Атол web-сервер
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class DelCookiesService{
        constructor(private http: HttpClient){ }

    delCookiesOnLogin(){
        Cookie.set('anotherCashierFio','undefined', -1, '/');
        Cookie.set('anotherCashierVatin','undefined', -1, '/');
        Cookie.set('dokio_token', '', -1, '/');

        Cookie.delete('anotherCashierFio');
        Cookie.delete('anotherCashierVatin');
        // Cookie.delete('dokio_token');
        // alert(Cookie.get('dokio_token'));
    }


}