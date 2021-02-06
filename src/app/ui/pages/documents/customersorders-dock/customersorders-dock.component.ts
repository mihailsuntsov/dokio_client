import { ChangeDetectorRef, Component, OnInit, ViewChild,  OnChanges,  SimpleChanges } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { LoadSpravService } from '../../../../services/loadsprav';
import { KkmAtolService } from '../../../../services/kkm_atol';
import { KkmAtolChequesService } from '../../../../services/kkm_atol_cheques';
import { FormGroup, FormArray,  FormBuilder,  Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShowImageDialog } from 'src/app/ui/dialogs/show-image-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, tap, switchMap, mergeMap, concatMap  } from 'rxjs/operators';
import { MomentDateAdapter} from '@angular/material-moment-adapter';
import { ConfirmDialog } from 'src/app/ui/dialogs/confirmdialog-with-custom-text.component';
import { ProductsDockComponent } from '../products-dock/products-dock.component';
import { MatDialog } from '@angular/material/dialog';
import { ValidationService } from './validation.service';
import { ProductReservesDialogComponent } from 'src/app/ui/dialogs/product-reserves-dialog/product-reserves-dialog.component';
import { PricingDialogComponent } from 'src/app/ui/dialogs/pricing-dialog/pricing-dialog.component';
import { SettingsCustomersordersDialogComponent } from 'src/app/ui/dialogs/settings-customersorders-dialog/settings-customersorders-dialog.component';
import { ProductSearchAndTableComponent } from 'src/app/modules/trade-modules/product-search-and-table/product-search-and-table.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MessageDialog } from 'src/app/ui/dialogs/messagedialog.component';
import { MatAccordion } from '@angular/material/expansion';
import { DelCookiesService } from './del-cookies.service';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Input } from '@angular/core';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
const moment = _rollupMoment || _moment;
moment.defaultFormat = "DD.MM.YYYY";
moment.fn.toJSON = function() { return this.format('DD.MM.YYYY'); }
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
interface CustomersOrdersProductTable { //интерфейс для формы, массив из которых будет содержать форма customersOrdersProductTable, входящая в formBaseInformation, которая будет включаться в formBaseInformation
  id: number;
  row_id: number;
  product_id: number;
  customers_orders_id:number;
  name: string;
  product_count: number;
  edizm: string;
  edizm_id: number;
  product_price: number;
  product_price_of_type_price: number;//цена товара по типу цены. Т.к. цену можно редактировать в таблице товаров, при несовпадении новой цены с ценой типа цены нужно будет сбросить тип цены в 0 (не выбран), т.к. это уже будет не цена типа цены
  product_sumprice: number;
  price_type: string;
  price_type_id: number;
  available: number; 
  nds: string;
  nds_id: number;
  reserve: boolean;// зарезервировано                                                                                (formSearch.reserve)
  priority_type_price: string;// приоритет типа цены: Склад (sklad) Покупатель (cagent) Цена по-умолчанию (defprice)  (formSearch.priorityTypePriceSide)
  department_id: number; // склад с которого будет производиться отгрузка товара.     
  department: string; // склад с которого будет производиться отгрузка товара.                                   (secondaryDepartmentId)
  shipped:number; //отгружено        
  total: number; //всего на складе
  reserved: number; // сколько зарезервировано в других Заказах покупателя
  reserved_current: number; // сколько зарезервировано в данном заказе покупателя  
  ppr_name_api_atol: string; //Признак предмета расчета в системе Атол. Невидимое поле. Нужно для передачи в таблицу товаров в качестве тега для чека на ккм Атол
  is_material: boolean; //определяет материальный ли товар/услуга. Нужен для отображения полей, относящихся к товару и их скрытия в случае если это услуга (например, остатки на складе, резервы - это неприменимо к нематериальным вещам - услугам, работам)            
}
interface IdAndName_ru{
  id: number;
  name_ru: string;
}
interface SpravSysNdsSet{
  id: number;
  name: string;
  description: string;
  name_api_atol: string;
  is_active: string;
  calculated: string;
}
interface Region{
  id: number;
  name_ru: string;
  country_id: number;
  country_name_ru: string;
}
interface City{
  id: number;
  name_ru: string;
  country_id: number;
  country_name_ru: string;
  region_id: number;
  region_name_ru: string;
  area_ru: string;
}
interface dockResponse {//интерфейс для получения ответа в методе getCustomersOrdersValuesById
  id: number;
  company: string;
  company_id: number;
  department: string;
  department_id: number;
  creator: string;
  creator_id: number;
  master: string;
  master_id: number;
  is_completed: boolean;
  changer:string;
  nds: boolean;
  cagent: string;
  cagent_id: number;
  nds_included: boolean;
  changer_id: number;
  doc_number: string;
  shipment_date: string;//планируемая дата отгрузки
  date_time_changed: string;
  date_time_created: string;
  description : string;
  // overhead: string;
  is_archive: boolean;
  department_type_price_id: number;
  cagent_type_price_id: number;
  default_type_price_id: number;
  name: string;
  status_id: number;
  status_name: string;
  status_color: string;
  status_description: string;
  fio: string;
  email: string;
  telephone: string;
  zip_code: string;
  country_id: string;
  region_id: string;
  city_id: number;
  additional_address: string;
  track_number: string;
  country: string;
  region: string;
  area: string;
  city: string;
  street: string;
  home: string;
  flat: string;
}

interface filesInfo {
  id: string;
  name: string;
  original_name: string;
  date_time_created: string;
}
interface idAndName{ //универсалный интерфейс для выбора из справочников
  id: number;
  name: string;
}
interface idAndCount{ //интерфейс для запроса количества товара
  id: number;
  reserved: number;
  total: number;
}
interface idNameDescription{
  id: number;
  name: string;
  description: string;
}
interface idAndNameAndShorname{ //универсалный интерфейс для выбора из справочников
  id: string;
  name: string;
  short_name: string;
}
interface ShortInfoAboutProduct{//интреф. для получения инфо о состоянии товара в отделении (кол-во, последняя поставка), и средним ценам (закупочной и себестоимости) товара
  quantity:number;
  change:number;
  avg_purchase_price:number;
  avg_netcost_price:number;
  last_purchase_price:number;
  department_sell_price:number;
  department_type_price:string;
  date_time_created:string;
}
interface SecondaryDepartment{
  id: number;
  name: string;
  pricetype_id: number;
  reserved: number;
  total: number;
}
interface statusInterface{
  id:number;
  name:string;
  status_type:number;//тип статуса: 1 - обычный; 2 - конечный положительный 3 - конечный отрицательный
  output_order:number;
  color:string;
  description:string;
  is_default:boolean;
}
interface KassaList{
  id: number;// id  кассы
  company_id: number; // id предприятия
  department_id: number; // id отделения
  name: string; // наименование кассы
  server_type: string; // тип сервера (атол или ккмсервер)
  sno1_id: number; // id системы налогообложения
  device_server_uid: string;// уник. идентификатор кассы на сервере
  server_address: string;//адрес сервера в сети
  sno1_name_api_atol:string; //система налогообложения кассы
  billing_address:string; // адрес места расчетов
  company_email:string; // email предприятия
}
interface KassaSettings{
  selected_kassa_id: number;// id выбранной кассы
  cashier_value_id:string;//кассир: 'current'-текущая учетная запись, 'another'-другая учетная запись, 'custom' произвольные ФИО
  customCashierFio:string;// произвольное ФИО кассира (для cashier_value_id = custom)
  customCashierVatin:string;//произвольный ИНН кассира (для cashier_value_id = custom)
  billing_address:string; // id адреса места расчётов. 'settings' - как в настройках кассы, 'customer' - брать из адреса заказчика, 'custom' произвольный адрес. Если 2 или 3 нет но один из них выбран - печатается settings
  custom_billing_address:string; // кастомный адрес расчетов

}

@Component({
  selector: 'app-customersorders-dock',
  templateUrl: './customersorders-dock.component.html',
  styleUrls: ['./customersorders-dock.component.css'],
  providers: [LoadSpravService,KkmAtolService,KkmAtolChequesService,Cookie,DelCookiesService,ProductSearchAndTableComponent,
    {provide: MAT_DATE_LOCALE, useValue: 'ru'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},]
})

export class CustomersordersDockComponent implements OnInit/*, OnChanges */{

  id: number = 0;// id документа
  createdDockId: string[];//массив для получение id созданного документа
  receivedCompaniesList: any [];//массив для получения списка предприятий
  receivedDepartmentsList: SecondaryDepartment [] = [];//массив для получения списка отделений
  receivedStatusesList: statusInterface [] = []; // массив для получения статусов
  receivedMyDepartmentsList: SecondaryDepartment [] = [];//массив для получения списка отделений
  receivedUsersList  : any [];//массив для получения списка пользователей
  myCompanyId:number=0;
  
  allFields: any[][] = [];//[номер строки начиная с 0][объект - вся инфо о товаре (id,кол-во, цена... )] - массив товаров
  filesInfo : filesInfo [] = []; //массив для получения информации по прикрепленным к документу файлам 
  myId:number=0;
  creatorId:number=0;
  is_addingNewCagent: boolean = false; // при создании документа создаём нового получателя (false) или ищем уже имеющегося (true)
  panelContactsOpenState = true;
  panelAddressOpenState = false;
  addressString: string = ''; // строка для свёрнутого блока Адрес
  gettingTableData:boolean=false;//идет загрузка данных - нужно для спиннера
  canCreateNewDock: boolean=false;// можно ли создавать новый документ (true если выполнились все необходимые для создания действия)
  canGetChilds: boolean=false; //можно ли грузить дочерние модули
  actionsBeforeCreateNewDock:number=0;// количество выполненных действий, необходимых чтобы создать новый документ
  аctionsBeforeGetChilds:number=0;// количество выполненных действий, необходимых чтобы загрузить дочерние модули (кассу и форму товаров)
  // productsTableIsValid=false;
  // Расценка (все настройки здесь - по умолчанию. После первого же сохранения настроек данные настройки будут заменяться в методе getSettings() )
  productPrice:number=0; //Цена найденного и выбранного в форме поиска товара.
  netCostPrice:number = 0; // себестоимость найденного и выбранного в форме поиска товара.
  priceUpDownFieldName:string = 'Наценка'; // Наименование поля с наценкой-скидкой
  priceTypeId_temp:number; // id типа цены. Нужна для временного хранения типа цены на время сброса формы поиска товара
  companyId_temp:number; // id предприятия. Нужна для временного хранения предприятия на время сброса формы formBaseInformation

  department_type_price_id: number; //id тип цены в отделении (Складе), для которого создавался данный документ. Нужен для изменения поля Тип цены
  cagent_type_price_id: number; //id типа цены покупателя, для которого создавался данный документ.  Нужен для изменения поля Тип цены
  default_type_price_id: number; //id типа цены, установленный по умолчанию.  Нужен для изменения поля Тип цены
  spravSysNdsSet: SpravSysNdsSet[] = []; //массив имен и id для ндс 
  secondaryDepartments:SecondaryDepartment[]=[];// склады в выпадающем списке складов формы поиска товара
  spravSysEdizmOfProductAll: idAndNameAndShorname[] = [];// массив, куда будут грузиться все единицы измерения товара
  receivedPriceTypesList: idNameDescription [] = [];//массив для получения списка типов цен

  //поиск адреса и юр. адреса (Страна, Район, Город):
  // Страны 
  spravSysCountries: IdAndName_ru[] = [];// массив, куда будут грузиться все страны 
  filteredSpravSysCountries: Observable<IdAndName_ru[]>; //массив для отфильтрованных Страна 
  // Регионы
  //для поиска района по подстроке
  searchRegionCtrl = new FormControl();//поле для поиска
  isRegionListLoading = false;//true когда идет запрос и загрузка списка. Нужен для отображения индикации загрузки
  canRegionAutocompleteQuery = false; //можно ли делать запрос на формирование списка для Autocomplete, т.к. valueChanges отрабатывает когда нужно и когда нет.
  filteredRegions: Region[];//массив для загрузки найденных по подстроке регионов
  // Города
  //для поиска района по подстроке
  searchCityCtrl = new FormControl();//поле для поиска
  isCityListLoading = false;//true когда идет запрос и загрузка списка. Нужен для отображения индикации загрузки
  canCityAutocompleteQuery = false; //можно ли делать запрос на формирование списка для Autocomplete, т.к. valueChanges отрабатывает когда нужно и когда нет.
  filteredCities: City[];//массив для загрузки найденных по подстроке городов
  // Районы 
  area:string = '';

  // Формы
  formAboutDocument:any;//форма, содержащая информацию о документе (создатель/владелец/изменён кем/когда)
  formBaseInformation: FormGroup; //массив форм для накопления информации о Заказе покупателя
  settingsForm: any; // форма с настройками

  //переменные для управления динамическим отображением элементов
  visBeforeCreatingBlocks = true; //блоки, отображаемые ДО создания документа (до получения id)
  visAfterCreatingBlocks = true; //блоки, отображаемые ПОСЛЕ создания документа (id >0)
  visBtnUpdate = false;
  visBtnAdd:boolean;
  visBtnCopy = false;
  visBtnDelete = false;

  //переменные прав
  permissionsSet: any[];//сет прав на документ
  allowToViewAllCompanies:boolean = false;
  allowToViewMyCompany:boolean = false;
  allowToViewMyDepartments:boolean = false;
  allowToViewMyDocs:boolean = false;
  allowToUpdateAllCompanies:boolean = false;
  allowToUpdateMyCompany:boolean = false;
  allowToUpdateMyDepartments:boolean = false;
  allowToUpdateMyDocs:boolean = false;
  allowToCreateMyCompany:boolean = false;
  allowToCreateAllCompanies:boolean = false;
  allowToCreateMyDepartments:boolean = false;
  allowToView:boolean = false;
  allowToUpdate:boolean = false;
  allowToCreate:boolean = false;
  showOpenDocIcon:boolean=false;
  editability:boolean = false;//редактируемость. true если есть право на создание и документ создаётся, или есть право на редактирование и документ создан

  //****************************                   Взаимодействие с ККМ                    ************************************
  kassa_status:string; //статус взаимодействия с ККМ
  shift_status:string; //статус смены ККМ
  shiftStatusId:string; //id статуса смены ККМ: closed - закрыта  opened - открыта  expired - истекла (превысила 24 часа)
  operationId: string = "undefined"; // алиас операции с ККМ (например sell или openShift). Сначала ставим undefined, пока не определим в методе setCanWorkWithKassa() можно ли работать с кассой 
  operationName: string = "Операции с ККМ"; //наименование операции с ККМ (выбирается из меню блока Операции с ККМ)
  nal_income: string=''; //внесено в кассу наличными при оплате. string - для возможности оставлять поле пустым (иначе будет 0, который нужно будет сначала удалять, а потом уже вписывать значение, что неудобно для кассира)
  bnal_income: string=''; //оплачено безналичными (при смешанной форме оплаты)
  kktBlockSize: string='small';// высота блока операций с ККМ. Нужна для её динамического увеличения 
  userInfo: any;//информация о пользователе
  kassaList:KassaList[]; //массив с загруженными кассами для кассира
  loginform: any ; //форма для логина другого кассира
  kassaSettingsForm: any; //форма с настройками кассира. нужна для из сохранения
  kassaSettings: KassaSettings;//настройки кассира/ нужны для восстановления настроек в случае их изменения и не сохранения
  anotherCashierIsLoggedIn = false;
  cashierFio: string=''// ФИО кассира, которое будет выводиться в кассу. 
  cashierVatin : string=''// ИНН кассира, который будет выводиться в кассу.
  anotherCashierFio = '';// ФИО кассира другой (another) учетной записи
  anotherCashierVatin='';// ИНН кассира другой (another) учетной записи
  canWorkWithKassa=false;// возможно ли работать с кассой. false если например не выбрана касса, пустое имя кассира или адрес расчетов
  cheque_nds=false; //нужно ли проставлять НДС в чеке. 
  // установки кассы для связи с сервером и печати чека (тегов чека)
  server_type: string; // тип сервера (атол или ккмсервер)
  device_server_uid: string;// уник. идентификатор кассы на сервере
  server_address: string;//адрес сервера в сети
  sno1_name_api_atol:string=''; //система налогообложения кассы
  kassa_billing_address:string=''; //адрес места расчётов в документе "Касса"
  company_email:string=''; // email предприятия
  server_type_temp: string; // тип сервера (атол или ккмсервер) - для теста связи
  device_server_uid_temp: string;// уник. идентификатор кассы на сервере - для теста связи
  server_address_temp: string;//адрес сервера в сети - для теста связи
  billingAddress: string='';// финальный адрес места расчётов, который будет передаваться в кассу при печати чека. (paymentsPlace	Место проведения расчета (тег 1187))
  // для избежания дабл-клика и повторной печати чеков:
  sellReceiptIsPrinted: boolean=false;                //Чек прихода
  buyReceiptIsPrinted: boolean=false;                 //Чек расхода
  sellReturnReceiptIsPrinted: boolean=false;          //Чек возврата прихода
  buyReturnReceiptIsPrinted: boolean=false;           //Чек возврата расхода
  sellCorrectionReceiptIsPrinted: boolean=false;      //Чек коррекции прихода
  buyCorrectionReceiptIsPrinted: boolean=false;       //Чек коррекции расхода
  sellReturnCorrectionReceiptIsPrinted: boolean=false;//Чек коррекции возврата прихода (ФФД 1.1)
  buyReturnCorrectionReceiptIsPrinted: boolean=false; //Чек коррекции возврата расхода (ФФД 1.1)
  correctionBaseDate:string='';//Дата совершения корректируемого расчета (тег 1178)
  correctionType:string='self';//Тип коррекции (тег 1173)	self - самостоятельно, instruction - по предписанию
  correctionBaseNumber:string='';//Номер предписания налогового органа (тег 1179)
  correctionCommentary:string='';//Комментарий для чека коррекции
  // тест соединения с кассой
  test_status:string=''; // статус соединения (200, 404 и т.д.)
  wasConnectionTest:boolean=false;// был ли тест соединения с кассой
  requestToServer:boolean=false;// идет запрос к серверу
  testSuccess=false;// запрос к серверу был со статусом 200


  displayedColumns:string[];
  @ViewChild("countInput", {static: false}) countInput;
  @ViewChild("nameInput", {static: false}) nameInput; 
  @ViewChild("doc_number", {static: false}) doc_number; 
  @ViewChild("form", {static: false}) form; 
  @ViewChild("formCashierLogin", {static: false}) formCashierLogin; 
  @ViewChild("formBI", {static: false}) formBI; 
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild(ProductSearchAndTableComponent, {static: false}) public productSearchAndTableComponent:ProductSearchAndTableComponent;
  @Input() authorized: boolean;

  isDocNumberUnicalChecking = false;//идёт ли проверка на уникальность номера
  doc_number_isReadOnly=true;
  is_completed=false;

  //для поиска контрагента (получателя) по подстроке
  searchCagentCtrl = new FormControl();//поле для поиска
  isCagentListLoading = false;//true когда идет запрос и загрузка списка. Нужен для отображения индикации загрузки
  canCagentAutocompleteQuery = false; //можно ли делать запрос на формирование списка для Autocomplete, т.к. valueChanges отрабатывает когда нужно и когда нет.
  filteredCagents: any;

  constructor(private activateRoute: ActivatedRoute,
    private cdRef:ChangeDetectorRef,
    private _fb: FormBuilder, //чтобы билдить группу форм customersOrdersProductTable
    private http: HttpClient,
    public ShowImageDialog: MatDialog,
    public ConfirmDialog: MatDialog,
    public dialogAddFiles: MatDialog,
    public ProductReservesDialogComponent: MatDialog,
    public PricingDialogComponent: MatDialog,
    public SettingsCustomersordersDialogComponent: MatDialog,
    public dialogCreateProduct: MatDialog,
    public MessageDialog: MatDialog,
    private loadSpravService:   LoadSpravService,
    private kkmAtolService: KkmAtolService,
    private kkmAtolChequesService:KkmAtolChequesService,
    private Cookie: Cookie,
    private _snackBar: MatSnackBar,
    private _router:Router) 
    { 
      if(activateRoute.snapshot.params['id'])
        this.id = +activateRoute.snapshot.params['id'];
    }

  ngOnInit() {
    this.formBaseInformation = new FormGroup({
      id: new FormControl                 (this.id,[]),
      company_id: new FormControl         ('',[Validators.required]),
      department_id: new FormControl      ('',[Validators.required]),
      doc_number: new FormControl         ('',[Validators.maxLength(10),Validators.pattern('^[0-9]{1,10}$')]),
      cagent_id: new FormControl          ({disabled: false, value: '' },[Validators.required]),
      cagent: new FormControl             ('',[]),
      shipment_date: new FormControl      ('',[Validators.required]),
      description: new FormControl        ('',[]),
      department: new FormControl         ('',[]),
      is_completed: new FormControl       (false,[]),
      customersOrdersProductTable: new FormArray([]),
      nds: new FormControl                (false,[]),
      nds_included: new FormControl       (true,[]),
      name: new FormControl               ('',[]),
      status_id: new FormControl          ('',[Validators.required]),
      status_name: new FormControl        ('',[]),
      status_color: new FormControl       ('',[]),
      status_description: new FormControl ('',[]),
      fio: new FormControl                ('',[]),
      email: new FormControl              ('',[]),
      telephone: new FormControl          ('',[]),
      zip_code: new FormControl           ('',[]),
      country_id: new FormControl         ('',[]),
      region_id: new FormControl          ('',[]),
      city_id: new FormControl            ('',[]),
      additional_address: new FormControl ('',[]),
      track_number: new FormControl       ('',[]),
      country: new FormControl            ('',[]),
      region: new FormControl             ('',[]),
      city: new FormControl               ('',[]),
      new_cagent: new FormControl          ({disabled: true, value: '' },[Validators.required]),
      street:  new FormControl            ('',[Validators.maxLength(120)]),
      home:  new FormControl              ('',[Validators.maxLength(16)]),
      flat:  new FormControl              ('',[Validators.maxLength(8)]),
      discount_card:   new FormControl    ('',[Validators.maxLength(30)]),


    });
    this.formAboutDocument = new FormGroup({
      id: new FormControl                       ('',[]),
      master: new FormControl                   ('',[]),
      creator: new FormControl                  ('',[]),
      changer: new FormControl                  ('',[]),
      company: new FormControl                  ('',[]),
      date_time_created: new FormControl        ('',[]),
      date_time_changed: new FormControl        ('',[]),
    });

    // Форма настроек
    this.settingsForm = new FormGroup({
      // id отделения
      departmentId: new FormControl             (null,[]),
      //покупатель по умолчанию
      customerId: new FormControl               (null,[]),
      //наименование покупателя
      customer: new FormControl                 ('',[]),
      //наименование заказа по умолчанию
      orderName:  new FormControl               ('',[]),
      // тип расценки. priceType - по типу цены, costPrice - себестоимость, manual - вручную
      pricingType: new FormControl              ('priceType',[]),
      //тип цены
      priceTypeId: new FormControl              (null,[]),
      //наценка или скидка. В чем выражается (валюта или проценты) - определяет changePriceType
      changePrice: new FormControl              (50,[Validators.pattern('^[0-9]{1,7}(?:[.,][0-9]{0,2})?\r?$')]),
      // Наценка (plus) или скидка (minus)
      plusMinus: new FormControl                ('plus',[]),
      // выражение наценки (валюта или проценты): currency - валюта, procents - проценты
      changePriceType: new FormControl          ('procents',[]),
      //убрать десятые (копейки)
      hideTenths: new FormControl               (true,[]),
      //сохранить настройки
      saveSettings: new FormControl             (true,[]),
      //предприятие, для которого создаются настройки
      companyId: new FormControl                (null,[]),
      //наименование заказа
      name:  new FormControl                    ('',[]),
      //приоритет типа цены : Склад (sklad) Покупатель (cagent) Цена по-умолчанию (defprice)
      priorityTypePriceSide: new FormControl    ('defprice',[]),
      //настройки операций с ККМ
      //Оплата чека прихода (наличными - nal безналичными - electronically смешанная - mixed)
      selectedPaymentType:   new FormControl    ('cash',[]),
      //автосоздание на старте документа, если автозаполнились все поля
      autocreateOnStart: new FormControl        (false,[]),
      //автосоздание нового документа, если в текущем успешно напечатан чек
      autocreateOnCheque: new FormControl       (false,[]),
      //статус после успешного отбития чека, перед созданием нового документа
      statusIdOnAutocreateOnCheque: new FormControl('',[]),
    });

    //формы по кассе :
    //форма настроек кассира
    this.kassaSettingsForm = new FormGroup({
      selected_kassa_id: new FormControl             (null,[Validators.required]), // id кассы
      cashier_value_id: new FormControl         ('current',[Validators.required]), //кассир: 'current'-текущая учетная запись, 'another'-другая учетная запись, 'custom' произвольные ФИО
      customCashierFio: new FormControl         ('',[Validators.required]), // значение поля ФИО при выборе пункта "Произвольное ФИО"
      customCashierVatin: new FormControl       ('',[Validators.required,Validators.pattern('^[0-9]{12}$'),Validators.maxLength(12),Validators.minLength(12)]),// значение поля ИНН при выборе пункта "Произвольное ФИО"
      billing_address: new FormControl           ('settings',[]),// id адреса места расчётов. 'settings' - как в настройках кассы, 'customer' - брать из адреса заказчика, 'custom' произвольный адрес. Если 2 или 3 нет но один из них выбран - печатается settings
      custom_billing_address: new FormControl     ('',[Validators.required]),// адрес места расчетов типа г.Такой-то, ул.... и т.д.
    });
    //логин другого кассира
    this.loginform = new FormGroup({
      username: new FormControl ('',[Validators.required,Validators.minLength(6)]),
      password: new FormControl ('',[Validators.required]),
    });
    if(Cookie.get('anotherCashierVatin')=='undefined' || Cookie.get('anotherCashierVatin')==null)    
      Cookie.set('anotherCashierVatin',''); else this.anotherCashierVatin=Cookie.get('anotherCashierVatin');

    if(Cookie.get('anotherCashierFio')=='undefined' || Cookie.get('anotherCashierFio')==null)    
      Cookie.set('anotherCashierFio',''); else this.anotherCashierFio=Cookie.get('anotherCashierFio');

    this.kassaSettingsForm.get("customCashierFio").disable();
    this.kassaSettingsForm.get("customCashierVatin").disable();


    this.onCagentSearchValueChanges();//отслеживание изменений поля "Покупатель"
    this.getSetOfPermissions();//
    this.getSpravSysNds();// загрузка справочника НДС
    //   getSetOfPermissions()
    // ->getMyId()
    // ->getMyCompanyId()
    // ->getMyDepartmentsList()
    // ->getCRUD_rights()
    // ->getData()------>(если созданный док)---> this.getDocumentValuesById(); --> refreshPermissions()     
    // ->(если новый док):
    // ->getCompaniesList(),getSpravSysCountries()*,this.setDefaultDate()*  
    // ->setDefaultCompany() ---------------------------------------------------->getSettings()
    // ->getDepartmentsList()                                                   ->setDefaultInfoOnStart()*
    // ->setDefaultDepartment()
    // ->getStatusesList()
    // ->setDefaultStatus()
    // ->refreshPermissions()*

    //слушалки на изменение полей адреса
    this.filteredSpravSysCountries=this.formBaseInformation.get('country').valueChanges.pipe(startWith(''),map((value:string) => this.filter_country(value)));
    this.onRegionSearchValueChanges();
    this.onCitySearchValueChanges();

  }

  get childFormValid() {
    if(this.productSearchAndTableComponent!=undefined)
      return this.productSearchAndTableComponent.getControlTablefield().valid;
    else return true;    //чтобы не было ExpressionChangedAfterItHasBeenCheckedError. Т.к. форма создается пустая и с .valid=true, а потом уже при заполнении проверяется еще раз.
  }
  //---------------------------------------------------------------------------------------------------------------------------------------                            
  // ----------------------------------------------------- *** ПРАВА *** ------------------------------------------------------------------
  //---------------------------------------------------------------------------------------------------------------------------------------

  getSetOfPermissions(){
    const body = {"documentId": 23};//23= Заказы покупателей 
             return this.http.post('/api/auth/giveMeMyPermissions', body) 
      .subscribe(
          (data) => {   
                      this.permissionsSet=data as any [];
                      this.getMyId();
                  },
          error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})},
      );
  }

  getCRUD_rights(permissionsSet:any[]){
    this.allowToCreateAllCompanies = permissionsSet.some(         function(e){return(e==280)});
    this.allowToCreateMyCompany = permissionsSet.some(            function(e){return(e==281)});
    this.allowToCreateMyDepartments = permissionsSet.some(        function(e){return(e==282)});
    this.allowToViewAllCompanies = permissionsSet.some(           function(e){return(e==287)});
    this.allowToViewMyCompany = permissionsSet.some(              function(e){return(e==288)});
    this.allowToViewMyDepartments = permissionsSet.some(          function(e){return(e==289)});
    this.allowToViewMyDocs = permissionsSet.some(                 function(e){return(e==290)});
    this.allowToUpdateAllCompanies = permissionsSet.some(         function(e){return(e==291)});
    this.allowToUpdateMyCompany = permissionsSet.some(            function(e){return(e==292)});
    this.allowToUpdateMyDepartments = permissionsSet.some(        function(e){return(e==293)});
    this.allowToUpdateMyDocs = permissionsSet.some(               function(e){return(e==294)});

    this.getData();
  }

  refreshPermissions(){
    let documentOfMyCompany:boolean = (this.formBaseInformation.get('company_id').value==this.myCompanyId);
    let documentOfMyDepartments:boolean = (this.inMyDepthsId(+this.formBaseInformation.get('department_id').value));
    this.allowToView=(
      (this.allowToViewAllCompanies)||
      (this.allowToViewMyCompany&&documentOfMyCompany)||
      (this.allowToViewMyDepartments&&documentOfMyCompany&&documentOfMyDepartments)||
      (this.allowToViewMyDocs&&documentOfMyCompany&&documentOfMyDepartments&&(this.myId==this.creatorId))
    )?true:false;
    this.allowToUpdate=(
      (this.allowToUpdateAllCompanies)||
      (this.allowToUpdateMyCompany&&documentOfMyCompany)||
      (this.allowToUpdateMyDepartments&&documentOfMyCompany&&documentOfMyDepartments)||
      (this.allowToUpdateMyDocs&&documentOfMyCompany&&documentOfMyDepartments&&(this.myId==this.creatorId))
    )?true:false;
    this.allowToCreate=(this.allowToCreateAllCompanies || this.allowToCreateMyCompany||this.allowToCreateMyDepartments)?true:false;
    
    if(this.id>0){//если в документе есть id
      this.visAfterCreatingBlocks = true;
      this.visBeforeCreatingBlocks = false;
      this.visBtnUpdate = this.allowToUpdate;
    }else{
      this.visAfterCreatingBlocks = false;
      this.visBeforeCreatingBlocks = true;
    }
    this.editability=((this.allowToCreate && +this.id==0)||(this.allowToUpdate && this.id>0));
    // console.log("myCompanyId - "+this.myCompanyId);
    // console.log("documentOfMyCompany - "+documentOfMyCompany);
    // console.log("allowToView - "+this.allowToView);
    // console.log("allowToUpdate - "+this.allowToUpdate);
    // console.log("allowToCreate - "+this.allowToCreate);
    // return true;
    this.necessaryActionsBeforeAutoCreateNewDock();
    this.necessaryActionsBeforeGetChilds();
  }

  getData(){
    if(+this.id>0){
      this.getDocumentValuesById();
    }else {
      this.getCompaniesList(); 
      this.setDefaultDate();
      this.accordion.openAll();
      this.getSpravSysCountries();
    }

  }
  // т.к. всё грузится и обрабатывается асинхронно, до авто-создания документа необходимо чтобы выполнились все нужные для этого действия
  necessaryActionsBeforeAutoCreateNewDock(){
    // canCreateNewDock
    this.actionsBeforeCreateNewDock++;
          //Если набрано необходимое кол-во действий для создания вручную (по кнопке)
          if(this.actionsBeforeCreateNewDock==4) this.canCreateNewDock=true;
          //Если набрано необходимое кол-во действий для АВТОсоздания и есть автоматическое создание на старте (autocreateOnStart)
          if(this.actionsBeforeCreateNewDock==5 && this.settingsForm.get('autocreateOnStart').value){
            this.canCreateNewDock=true;
            this.createNewDocument();
          }
  }
  //нужно загруить всю необходимую информацию, прежде чем вызывать детей (Поиск и добавление товара, Кассовый модуль), иначе их ngOnInit выполнится быстрее, чем загрузится вся информация в родителе
  necessaryActionsBeforeGetChilds(){
    this.аctionsBeforeGetChilds++;
    //Если набрано необходимое кол-во действий
    if(this.аctionsBeforeGetChilds==4) this.canGetChilds=true;
  }
  refreshShowAllTabs(){
    if(this.id>0){//если в документе есть id
      this.visAfterCreatingBlocks = true;
      this.visBeforeCreatingBlocks = false;
      this.visBtnUpdate = this.allowToUpdate;
    }else{
      this.visAfterCreatingBlocks = false;
      this.visBeforeCreatingBlocks = true;
    }
  }

  getMyId(){
    this.receivedMyDepartmentsList=null;
    this.loadSpravService.getMyId()
            .subscribe(
                (data) => {this.myId=data as any;
                  this.getMyCompanyId();},
                error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
            );
  }
  getMyCompanyId(){
    this.loadSpravService.getMyCompanyId().subscribe(
      (data) => {
        this.myCompanyId=data as number;
        this.getMyDepartmentsList();
      }, error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
  }
  getMyDepartmentsList(){
    this.receivedMyDepartmentsList=null;
    this.loadSpravService.getMyDepartmentsListByCompanyId(this.myCompanyId,false)
            .subscribe(
                (data) => {this.receivedMyDepartmentsList=data as any [];
                  this.getCRUD_rights(this.permissionsSet);;},
                error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
            );
  }
  getCompaniesList(){
    this.receivedCompaniesList=null;
    this.loadSpravService.getCompaniesList()
      .subscribe(
          (data) => 
          {
            this.receivedCompaniesList=data as any [];
            this.doFilterCompaniesList();
            this.setDefaultCompany();
          },                      
          error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
      );
  }
  setDefaultCompany(){
      this.formBaseInformation.get('company_id').setValue(this.myCompanyId);
      this.getSettings();
      this.getDepartmentsList(true);
      this.getPriceTypesList();
  }

  onCompanyChange(){
    this.formBaseInformation.get('department_id').setValue(null);
    this.formBaseInformation.get('cagent_id').setValue(null);
    this.formBaseInformation.get('cagent').setValue('');
    
    this.resetAddressForm();
    this.resetContactsForm();

    this.searchCagentCtrl.setValue('');
    
    this.getSettings();
    this.getDepartmentsList();
    this.getPriceTypesList();
    this.formExpansionPanelsString();
  }

  resetAddressForm(){
    this.formBaseInformation.get('zip_code').setValue('');         
    this.formBaseInformation.get('country_id').setValue('');          
    this.formBaseInformation.get('region_id').setValue('');           
    this.formBaseInformation.get('city_id').setValue('');             
    this.formBaseInformation.get('additional_address').setValue('');   
    this.formBaseInformation.get('track_number').setValue('');        
    this.formBaseInformation.get('country').setValue('');             
    this.formBaseInformation.get('region').setValue('');              
    this.formBaseInformation.get('city').setValue('');  
    this.formBaseInformation.get('street').setValue('');
    this.formBaseInformation.get('home').setValue('');
    this.formBaseInformation.get('flat').setValue('');
    this.searchRegionCtrl.setValue('');              
    this.searchCityCtrl.setValue('');              
  }
  resetContactsForm(){
    this.formBaseInformation.get('email').setValue('');               
    this.formBaseInformation.get('telephone').setValue('');           
  }
  getDepartmentsList(newdock?:boolean){
    this.receivedDepartmentsList=null;
    // this.formBaseInformation.get('department_id').setValue('');
    this.loadSpravService.getDepartmentsListByCompanyId(this.formBaseInformation.get('company_id').value,false)
            .subscribe(
                (data) => {this.receivedDepartmentsList=data as any [];
                  this.doFilterDepartmentsList();
                  if(newdock){//если документ еще не создан 
                    this.setDefaultDepartment();
                  } else this.secondaryDepartments=this.receivedDepartmentsList;
                    
                },
                error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
            );
  }
  setDefaultDepartment(){
    if(this.receivedDepartmentsList.length==1)
    {
      let depId:number;
      this.receivedDepartmentsList.forEach(data =>{depId=+data.id;});
      this.formBaseInformation.get('department_id').setValue(depId);
    }
    this.getStatusesList();
  }

  getStatusesList(){
    this.receivedStatusesList=null;
    this.loadSpravService.getStatusList(this.formBaseInformation.get('company_id').value,23) //23 - id предприятия из таблицы documents
            .subscribe(
                (data) => {this.receivedStatusesList=data as statusInterface[];
                  if(this.id==0){this.setDefaultStatus();}},
                error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
            );
  }

  setDefaultStatus(){
    if(this.receivedStatusesList.length>0)
    {
      this.receivedStatusesList.forEach(a=>{
          if(a.is_default){
            this.formBaseInformation.get('status_id').setValue(a.id);
          }
      });
    }
    this.setStatusColor();
    this.getSpravSysEdizm(); //загрузка единиц измерения. Загружаем тут, т.к. нужно чтобы сначала определилось предприятие, его id нужен для загрузки
    this.refreshPermissions();
  }

  getSpravSysEdizm():void {    
    let companyId=+this.formBaseInformation.get('company_id').value;
    this.http.post('/api/auth/getSpravSysEdizm', {id1: companyId, string1:"(1,2,3,4,5)"})  // все типы ед. измерения
    .subscribe((data) => {this.spravSysEdizmOfProductAll = data as any[];
            },
    error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
  }

  setDefaultDate(){
    this.formBaseInformation.get('shipment_date').setValue(moment());
    this.necessaryActionsBeforeAutoCreateNewDock();
  }
  doFilterCompaniesList(){
    let myCompany:idAndName;
    if(!this.allowToCreateAllCompanies){
      this.receivedCompaniesList.forEach(company=>{
      if(this.myCompanyId==company.id) myCompany={id:company.id, name:company.name}});
      this.receivedCompaniesList=[];
      this.receivedCompaniesList.push(myCompany);
    }
  }
  doFilterDepartmentsList(){
    // console.log('doFilterDepartmentsList');
    if(!this.allowToCreateAllCompanies && !this.allowToCreateMyCompany && this.allowToCreateMyDepartments){
      this.receivedDepartmentsList=this.receivedMyDepartmentsList;}
  }
  inMyDepthsId(id:number):boolean{//проверяет, состоит ли присланный id в группе id отделений пользователя
    // console.log('inMyDepthsId');
    let inMyDepthsId:boolean = false;
    this.receivedMyDepartmentsList.forEach(myDepth =>{
      myDepth.id==id?inMyDepthsId=true:null;
    });
  return inMyDepthsId;
  }
  searchOrCreateNewCagent(is_adding:boolean){
    this.is_addingNewCagent=is_adding;
    if(is_adding){
      this.formBaseInformation.get('cagent_id').disable();
      this.formBaseInformation.get('new_cagent').enable();
    } else{
      this.formBaseInformation.get('cagent_id').enable();
      this.formBaseInformation.get('new_cagent').disable();
    }
    this.searchCagentCtrl.setValue('');
    this.formBaseInformation.get('new_cagent').setValue('');
    this.checkEmptyCagentField();
  }
  //  -------------     ***** поиск по подстроке для покупателя ***    --------------------------
  onCagentSearchValueChanges(){
    this.searchCagentCtrl.valueChanges
    .pipe(
      debounceTime(500),
      tap(() => {
        this.filteredCagents = [];}),       
      switchMap(fieldObject =>  
        this.getCagentsList()))
    .subscribe(data => {
      this.isCagentListLoading = false;
      if (data == undefined) {
        this.filteredCagents = [];
      } else {
        this.filteredCagents = data as any;
  }});}

  onSelectCagent(id:number,name:string){
    this.formBaseInformation.get('cagent_id').setValue(+id);
    this.getCagentValuesById(id);
  }

  getCagentValuesById(id:number){
    const body = {"id": id};
      this.http.post('/api/auth/getCagentValues', body).subscribe(
        data => { 
            let documentValues: dockResponse=data as any;

            this.formBaseInformation.get('telephone').setValue(documentValues.telephone==null?'':documentValues.telephone);
            this.formBaseInformation.get('email').setValue(documentValues.email==null?'':documentValues.email);
            this.formBaseInformation.get('zip_code').setValue(documentValues.zip_code==null?'':documentValues.zip_code);
            this.formBaseInformation.get('country_id').setValue(documentValues.country_id);
            this.formBaseInformation.get('region_id').setValue(documentValues.region_id);
            this.formBaseInformation.get('city_id').setValue(documentValues.city_id);
            this.formBaseInformation.get('street').setValue(documentValues.street==null?'':documentValues.street);
            this.formBaseInformation.get('home').setValue(documentValues.home==null?'':documentValues.home);
            this.formBaseInformation.get('flat').setValue(documentValues.flat==null?'':documentValues.flat);
            this.formBaseInformation.get('additional_address').setValue(documentValues.additional_address==null?'':documentValues.additional_address);
            this.searchRegionCtrl.setValue(documentValues.region==null?'':documentValues.region);
            this.area=documentValues.area==null?'':documentValues.area;
            this.searchCityCtrl.setValue(this.area!=''?(documentValues.city+' ('+this.area+')'):documentValues.city);
            if(+this.formBaseInformation.get('country_id').value!=0)
            {
              this.spravSysCountries.forEach(x => {
                if(x.id==this.formBaseInformation.get('country_id').value){
                  this.formBaseInformation.get('country').setValue(x.name_ru);
                }
              })
            }
            this.formExpansionPanelsString();
            this.necessaryActionsBeforeAutoCreateNewDock();
        },
        error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
    );
  }
  
  //загрузка настроек
  getSettings(){
    let result:any;
    this.http.get('/api/auth/getSettingsCustomersOrders')
      .subscribe(
          data => { 
            result=data as any;
            //вставляем настройки в форму настроек
            this.settingsForm.get('companyId').setValue(result.companyId);
            this.settingsForm.get('departmentId').setValue(result.departmentId);
            this.settingsForm.get('customerId').setValue(result.customerId);
            this.settingsForm.get('customer').setValue(result.customer);
            this.settingsForm.get('pricingType').setValue(result.pricingType?result.pricingType:'priceType');
            this.settingsForm.get('plusMinus').setValue(result.plusMinus?result.plusMinus:'plus');
            this.settingsForm.get('changePrice').setValue(result.changePrice?result.changePrice:50);
            this.settingsForm.get('changePriceType').setValue(result.changePriceType?result.changePriceType:'procents');
            this.settingsForm.get('hideTenths').setValue(result.hideTenths);
            this.settingsForm.get('saveSettings').setValue(result.saveSettings);
            this.settingsForm.get('name').setValue(result.name?result.name:'');
            this.settingsForm.get('priorityTypePriceSide').setValue(result.priorityTypePriceSide?result.priorityTypePriceSide:'defprice');
            this.settingsForm.get('autocreateOnStart').setValue(result.autocreateOnStart);
            this.settingsForm.get('autocreateOnCheque').setValue(result.autocreateOnCheque);
            this.settingsForm.get('statusIdOnAutocreateOnCheque').setValue(result.statusIdOnAutocreateOnCheque);
            
            this.necessaryActionsBeforeGetChilds();
            //вставляем Отделение и Покупателя (вставится только если новый документ)
            this.setDefaultInfoOnStart(result.departmentId,result.customerId,result.customer,result.name?result.name:'');
          },
          error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
      );
  }

  //если новый документ - вставляем Отделение и Покупателя (но только если они принадлежат выбранному предприятию, т.е. предприятие в Основной информации и предприятие, для которого были сохранены настройки совпадают)
  setDefaultInfoOnStart(departmentId:number, customerId:number, customer:string, name:string){
    if(+this.id==0){
      if(+departmentId>0 && +this.settingsForm.get('companyId').value == +this.formBaseInformation.get('company_id').value){
        // this.formSearch.get('secondaryDepartmentId').setValue(departmentId);
        this.formBaseInformation.get('department_id').setValue(departmentId);
      }
      if(+customerId>0 && +this.settingsForm.get('companyId').value == +this.formBaseInformation.get('company_id').value){
        this.searchCagentCtrl.setValue(customer);
        this.formBaseInformation.get('cagent_id').setValue(customerId);
        this.getCagentValuesById(customerId);
      }
      if(this.formBaseInformation.get('name').value=='')
        this.formBaseInformation.get('name').setValue(name);
      this.necessaryActionsBeforeAutoCreateNewDock();
    }
  }
  //при стирании наименования полностью нужно удалить id покупателя в скрытьм поле cagent_id 
  checkEmptyCagentField(){
    if(this.searchCagentCtrl.value.length==0){
      this.formBaseInformation.get('cagent_id').setValue(null);
      this.resetAddressForm();
      this.resetContactsForm();
      this.formExpansionPanelsString();
  }};     
  getCagentsList(){ //заполнение Autocomplete
    try {
      if(this.canCagentAutocompleteQuery && this.searchCagentCtrl.value.length>1){
        const body = {
          "searchString":this.searchCagentCtrl.value,
          "companyId":this.formBaseInformation.get('company_id').value};
        this.isCagentListLoading  = true;
        return this.http.post('/api/auth/getCagentsList', body);
      }else return [];
    } catch (e) {return [];}
  }
  getDocumentValuesById(){
    const dockId = {"id": this.id};
          this.http.post('/api/auth/getCustomersOrdersValuesById', dockId)
        .subscribe(
            data => { 
              
                let documentValues: dockResponse=data as any;// <- засовываем данные в интерфейс для принятия данных
                //Заполнение формы из интерфейса documentValues:
                this.formAboutDocument.get('id').setValue(+documentValues.id);
                this.formAboutDocument.get('master').setValue(documentValues.master);
                this.formAboutDocument.get('creator').setValue(documentValues.creator);
                this.formAboutDocument.get('changer').setValue(documentValues.changer);
                this.formAboutDocument.get('company').setValue(documentValues.company);
                this.formAboutDocument.get('date_time_created').setValue(documentValues.date_time_created);
                this.formAboutDocument.get('date_time_changed').setValue(documentValues.date_time_changed);
                this.formBaseInformation.get('id').setValue(+documentValues.id);
                this.formBaseInformation.get('company_id').setValue(documentValues.company_id);
                this.formBaseInformation.get('cagent_id').setValue(documentValues.cagent_id);
                this.formBaseInformation.get('cagent').setValue(documentValues.cagent);
                this.formBaseInformation.get('department_id').setValue(documentValues.department_id);
                this.formBaseInformation.get('department').setValue(documentValues.department);
                this.formBaseInformation.get('shipment_date').setValue(documentValues.shipment_date?moment(documentValues.shipment_date,'DD.MM.YYYY'):"");
                this.formBaseInformation.get('doc_number').setValue(documentValues.doc_number);
                this.formBaseInformation.get('description').setValue(documentValues.description);
                this.formBaseInformation.get('nds').setValue(documentValues.nds);
                this.formBaseInformation.get('nds_included').setValue(documentValues.nds_included);
                this.formBaseInformation.get('name').setValue(documentValues.name);
                this.formBaseInformation.get('status_id').setValue(documentValues.status_id);
                this.formBaseInformation.get('status_name').setValue(documentValues.status_name);
                this.formBaseInformation.get('status_color').setValue(documentValues.status_color);
                this.formBaseInformation.get('status_description').setValue(documentValues.status_description);
                this.formBaseInformation.get('fio').setValue(documentValues.fio);
                this.formBaseInformation.get('email').setValue(documentValues.email);
                this.formBaseInformation.get('telephone').setValue(documentValues.telephone);
                this.formBaseInformation.get('zip_code').setValue(documentValues.zip_code);
                this.formBaseInformation.get('country_id').setValue(documentValues.country_id);
                this.formBaseInformation.get('region_id').setValue(documentValues.region_id);
                this.formBaseInformation.get('city_id').setValue(documentValues.city_id);
                this.formBaseInformation.get('country_id').setValue(documentValues.country_id);
                this.formBaseInformation.get('street').setValue(documentValues.street);
                this.formBaseInformation.get('home').setValue(documentValues.home);
                this.formBaseInformation.get('flat').setValue(documentValues.flat);
                this.formBaseInformation.get('additional_address').setValue(documentValues.additional_address);
                this.formBaseInformation.get('track_number').setValue(documentValues.track_number);
                this.formBaseInformation.get('country').setValue(documentValues.country);
                this.formBaseInformation.get('region').setValue(documentValues.region);
                this.formBaseInformation.get('city').setValue(documentValues.city);
                this.searchRegionCtrl.setValue(documentValues.region);
                this.area=documentValues.area;
                this.searchCityCtrl.setValue(this.area!=''?(documentValues.city+' ('+this.area+')'):documentValues.city);
                if(+this.formBaseInformation.get('country_id').value!=0)
                {
                  this.spravSysCountries.forEach(x => {
                    if(x.id==this.formBaseInformation.get('country_id').value){
                      this.formBaseInformation.get('country').setValue(x.name_ru);
                    }
                  })
                }
                this.department_type_price_id=documentValues.department_type_price_id;
                this.cagent_type_price_id=documentValues.cagent_type_price_id;
                this.default_type_price_id=documentValues.default_type_price_id;
                this.creatorId=+documentValues.creator_id;
                this.searchCagentCtrl.setValue(documentValues.cagent);
                this.is_completed=documentValues.is_completed;
                this.getSettings(); // настройки документа Заказ покупателя
                this.getMyShortInfo();//краткая информация о пользователе
                this.getSpravSysEdizm();//справочник единиц измерения
                this.formExpansionPanelsString();
                this.getPriceTypesList();
                this.getDepartmentsList(false);//отделения
                this.getStatusesList();//статусы документа Заказ покупателя
                this.getSpravSysCountries();//Страны
                this.hideOrShowNdsColumn();//расчет прятать илипоказывать колонку НДС
                this.refreshPermissions();//пересчитаем права
                this.cheque_nds=documentValues.nds;//нужно ли передавать в кассу (в чек) данные об НДС
            },
            error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error}})}
        );
  }

  formExpansionPanelsString(){
    this.addressString='';
    if(this.formBaseInformation.get('zip_code').value!='') this.addressString+=this.formBaseInformation.get('zip_code').value+' ';
    if(this.formBaseInformation.get('country').value!='') this.addressString+=this.formBaseInformation.get('country').value+', ';
    if(this.formBaseInformation.get('region').value!='') this.addressString+=this.formBaseInformation.get('region').value+', ';
    if(this.formBaseInformation.get('city').value!='') this.addressString+=this.formBaseInformation.get('city').value+', ';
    if(this.formBaseInformation.get('street').value!='') this.addressString+='ул. '+this.formBaseInformation.get('street').value+' ';
    if(this.formBaseInformation.get('home').value!='') this.addressString+='д. '+this.formBaseInformation.get('home').value+' ';
    if(this.formBaseInformation.get('flat').value!='') this.addressString+='кв. '+this.formBaseInformation.get('flat').value+' ';
    if(this.formBaseInformation.get('additional_address').value!='') this.addressString+='('+this.formBaseInformation.get('additional_address').value+')';
    
    this.onBillingAddressChange(); // если адрес места растчетов "Адрес покупателя", он будет addressString
  }
  getTotalProductCount() {
    return  (this.formBaseInformation.value.customersOrdersProductTable.map(t => +t.product_count).reduce((acc, value) => acc + value, 0)).toFixed(3).replace(".000", "").replace(".00", "");
  }
  getTotalSumPrice() {
    return  (this.formBaseInformation.value.customersOrdersProductTable.map(t => +t.product_sumprice).reduce((acc, value) => acc + value, 0)).toFixed(2);
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;//т.к. IE использует event.keyCode, а остальные - event.which
    if (charCode > 31 && (charCode < 48 || charCode > 57)) { return false; } return true;}
  numberOnlyPlusDotAndComma(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;//т.к. IE использует event.keyCode, а остальные - event.which
    if (charCode > 31 && ((charCode < 48 || charCode > 57) && charCode!=44 && charCode!=46)) { return false; } return true;}
  numberOnlyPlusDot(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;//т.к. IE использует event.keyCode, а остальные - event.which
    if (charCode > 31 && ((charCode < 48 || charCode > 57) && charCode!=46)) { return false; } return true;}
  
  getFormIngexByProductId(productId:number):number{
    let retIndex:number;
    let formIndex:number=0;
    this.formBaseInformation.value.customersOrdersProductTable.map(i => 
        {
        if(+i['product_id']==productId){retIndex=formIndex}
        formIndex++;
        });return retIndex;}

  formingProductRowFromApiResponse(row: CustomersOrdersProductTable) {
    return this._fb.group({
      id: new FormControl (row.id,[]),
      product_id: new FormControl (row.product_id,[]),
      customers_orders_id: new FormControl (+this.id,[]),
      name: new FormControl (row.name,[]),
      product_count: new FormControl (row.product_count,[Validators.required, Validators.pattern('^[0-9]{1,7}(?:[.,][0-9]{0,3})?\r?$'), ValidationService.countMoreThanZero]),
      edizm: new FormControl (row.edizm,[]),
      edizm_id:  new FormControl (row.edizm_id,[]), 
      product_price:  new FormControl (this.numToPrice(row.product_price,2),[Validators.required,Validators.pattern('^[0-9]{1,7}(?:[.,][0-9]{0,2})?\r?$'),ValidationService.priceMoreThanZero]),
      product_price_of_type_price: new FormControl (row.product_price,[]),
      product_sumprice: new FormControl (this.numToPrice(row.product_sumprice,2),[]),
      available:  new FormControl ((row.total)-(row.reserved),[]),
      price_type:  new FormControl (row.price_type,[]),
      price_type_id: [row.price_type_id],
      nds:  new FormControl (row.nds,[]),
      nds_id: new FormControl (row.nds_id,[]),
      reserve:  new FormControl (row.reserve,[]),// переключатель Резерв
      reserved:  new FormControl (row.reserved,[]), // сколько зарезервировано этого товара в других документах за исключением этого
      total: new FormControl (row.total,[]),
      priority_type_price: new FormControl (row.priority_type_price,[]),// приоритет типа цены: Склад (sklad) Покупатель (cagent) Цена по-умолчанию (defprice)
      department_id: new FormControl (row.department_id,[]), //id отделения, выбранного в форме поиска 
      department: new FormControl (row.department,[]), //имя отделения, выбранного в форме поиска 
      shipped:  new FormControl (row.shipped,[]),
      ppr_name_api_atol:  new FormControl (row.ppr_name_api_atol,[]), //Признак предмета расчета в системе Атол
      is_material:  new FormControl (row.is_material,[]), //определяет материальный ли товар/услуга. Нужен для отображения полей, относящихся к товару и их скрытия в случае если это услуга (например, остатки на складе, резервы - это неприменимо к нематериальным вещам - услугам, работам)
      reserved_current:  new FormControl (row.reserved_current,[Validators.pattern('^[0-9]{1,7}(?:[.,][0-9]{0,3})?\r?$')]),// зарезервировано единиц товара в отделении (складе) в ЭТОМ (текущем) Заказе покупателя
    });
  }
   //Конвертирует число в строку типа 0.00 например 6.40, 99.25
  numToPrice(price:number,charsAfterDot:number) {
    //конертим число в строку и отбрасываем лишние нули без округления
    const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + charsAfterDot + "})?", "g")
    const a = price.toString().match(reg)[0];
    //находим положение точки в строке
    const dot = a.indexOf(".");
    // если число целое - добавляется точка и нужное кол-во нулей
    if (dot === -1) { 
        return a + "." + "0".repeat(charsAfterDot);
    }
    //елси не целое число
    const b = charsAfterDot - (a.length - dot) + 1;
    return b > 0 ? (a + "0".repeat(b)) : a;
  }

  hideOrShowNdsColumn(){
    if(this.formBaseInformation.get('nds').value){
      this.displayedColumns = ['select','name','product_count','edizm','product_price','product_sumprice','reserved_current','available','total','reserved','shipped','price_type','nds','department',/*'id','row_id','indx',*/'delete'];
    } else {
      this.displayedColumns = ['select','name','product_count','edizm','product_price','product_sumprice','reserved_current','available','total','reserved','shipped','price_type','department',/*'id','row_id','indx',*/'delete'];
    }
  }

  getControlTablefield(){
    const control = <FormArray>this.formBaseInformation.get('customersOrdersProductTable');
    return control;
  }

  EditDocNumber(): void {
    if(this.allowToUpdate && !this.is_completed){
      const dialogRef = this.ConfirmDialog.open(ConfirmDialog, {
        width: '400px',
        data:
        { 
          head: 'Редактирование номера документа',
          warning: 'Открыть поле "Номера документа" на редактирование?',
          query: 'Номер документа присваивается системой автоматически. Если Вы хотите его редактировать, и вместе с тем оставить возможность системе генерировать код в следующих документах, пожалуйста, не исползуйте более 9 цифр в номере.',
        },
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result==1){
          this.doc_number_isReadOnly = false ;
          setTimeout(() => { this.doc_number.nativeElement.focus(); }, 500);}
      });  
    } 
  }

  checkDocNumberUnical() {
    if(!this.formBaseInformation.get('doc_number').errors)
    {
      let Unic: boolean;
      this.isDocNumberUnicalChecking=true;
      const body = {
        "id3": +this.id, 
        "id1": +this.formBaseInformation.get('company_id').value,
        "id2": this.formBaseInformation.get('doc_number').value}; 
      return this.http.post('/api/auth/isCustomersOrdersNumberUnical',body)
      .subscribe(
          (data) => {   
                      Unic = data as boolean;
                      if(!Unic)this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Внимание!',message:'Введённый номер документа не является уникальным.',}});
                      this.isDocNumberUnicalChecking=false;
                  },
          error => {console.log(error),this.isDocNumberUnicalChecking=false;}
      );
    }
  }

  createNewDocument(){
    this.createdDockId=null;
    //если отправляем нового контрагента, в cagent_id отправляем null, и backend понимает что нужно создать нового контрагента:
    this.formBaseInformation.get('cagent_id').setValue(this.is_addingNewCagent?null:this.formBaseInformation.get('cagent_id').value);
    this.http.post('/api/auth/insertCustomersOrders', this.formBaseInformation.value)
            .subscribe(
                (data) =>   {
                                this.createdDockId=data as string [];
                                this.id=+this.createdDockId[0];
                                this.openSnackBar("Документ \"Заказ покупателя\" успешно создан", "Закрыть");
                                // this._router.navigate(['ui/customersordersdock/'+this.id]);
                                this._router.navigate(['/ui/customersordersdock', this.id]);
                                this.formBaseInformation.get('id').setValue(this.id);
                                this.getData();
                                this.formBaseInformation.get('cagent_id').enable();//иначе при сохранении он не будет отпраляться
                                
                            },
                error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})},
            );
  }

  updateDocument(onChequePrinting?:boolean){ 
    const control = <FormArray>this.formBaseInformation.get('customersOrdersProductTable');
    control.clear();
    //забираем таблицу товаров из дочернего компонента и записываем ее в основную форму для отправки всего этого дела на сохранение
    this.productSearchAndTableComponent.getProductTable().forEach(row=>{
      control.push(this.formingProductRowFromApiResponse(row));
    });
    return this.http.post('/api/auth/updateCustomersOrders',  this.formBaseInformation.value)
      .subscribe(
          (data) => 
          {   
            let response=data as any;
            if(onChequePrinting) this.getData();
            this.openSnackBar("Документ \"Заказ покупателя\" сохранён", "Закрыть");
            if(response.fail_to_reserve>0){//если у 1 или нескольких позиций резервы при сохранении были отменены
              this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Внимание!',message:
              'У некоторых позиций не был сохранён резерв, т.к. он превышал заказываемое либо доступное количество товара'
              }});
            }
          },
          error => {
            this.showQueryErrorMessage(error);
            },
      );
  } 

  showQueryErrorMessage(error:any){
    console.log(error);
      let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      this.MessageDialog.open(MessageDialog,
      {
        width:'400px',
        data:{
          head:'Ошибка!',
          message:errMsg}
      })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
    });
  }

  //открывает диалог настроек
  openDialogSettings() { 
    const dialogSettings = this.SettingsCustomersordersDialogComponent.open(SettingsCustomersordersDialogComponent, {
      maxWidth: '95vw',
      maxHeight: '95vh',
      height: '680px',
      width: '400px', 
      minHeight: '650px',
      data:
      { //отправляем в диалог:
        priceTypesList:   this.receivedPriceTypesList, //список типов цен
        receivedDepartmentsList: this.receivedDepartmentsList,//список отделений
        company_id: this.formBaseInformation.get('company_id').value, //предприятие (нужно для поиска покупателя)
        department_type_price_id: this.department_type_price_id,
        cagent_type_price_id: this.cagent_type_price_id,
        default_type_price_id: this.default_type_price_id,
        id: this.id, //чтобы понять, новый док или уже созданный
      },
    });
    dialogSettings.afterClosed().subscribe(result => {
      if(result){
        //если нажата кнопка Сохранить настройки - вставляем настройки в форму настроек и сохраняем
        if(result.get('companyId')) this.settingsForm.get('companyId').setValue(result.get('companyId').value);
        if(result.get('departmentId')) this.settingsForm.get('departmentId').setValue(result.get('departmentId').value);
        if(result.get('customerId')) this.settingsForm.get('customerId').setValue(result.get('customerId').value);
        if(result.get('customer')) this.settingsForm.get('customer').setValue(result.get('customer').value);
        if(result.get('pricingType')) this.settingsForm.get('pricingType').setValue(result.get('pricingType').value);
        // if(result.get('priceTypeId')) this.settingsForm.get('priceTypeId').setValue(result.get('priceTypeId').value);
        if(result.get('plusMinus')) this.settingsForm.get('plusMinus').setValue(result.get('plusMinus').value);
        if(result.get('changePrice')) this.settingsForm.get('changePrice').setValue(result.get('changePrice').value);
        if(result.get('changePriceType')) this.settingsForm.get('changePriceType').setValue(result.get('changePriceType').value);
        if(result.get('name')) this.settingsForm.get('name').setValue(result.get('name').value);
        if(result.get('priorityTypePriceSide')) this.settingsForm.get('priorityTypePriceSide').setValue(result.get('priorityTypePriceSide').value);
        this.settingsForm.get('hideTenths').setValue(result.get('hideTenths').value);
        this.settingsForm.get('saveSettings').setValue(result.get('saveSettings').value);
        this.settingsForm.get('autocreateOnStart').setValue(result.get('autocreateOnStart').value);
        this.settingsForm.get('autocreateOnCheque').setValue(result.get('autocreateOnCheque').value);
        this.settingsForm.get('statusIdOnAutocreateOnCheque').setValue(result.get('statusIdOnAutocreateOnCheque').value);
        this.saveSettingsCustomersOrders();
        //вставляем Отделение,Покупателя и Наименование заказа (вставится только если новый документ)
        this.setDefaultInfoOnStart(
          (result.get('departmentId')?result.get('departmentId').value:null),
          (+result.get('customerId').value>0?result.get('customerId').value:null),
          (+result.get('customerId').value>0?result.get('customer').value:null),
          (result.get('name')?result.get('name').value:''),
          );
      }
    });
  }
  saveSettingsCustomersOrders(){
    return this.http.post('/api/auth/saveSettingsCustomersOrders', this.settingsForm.value)
            .subscribe(
                (data) => {   
                          this.openSnackBar("Настройки успешно сохранены", "Закрыть");
                          
                        },
                error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})},
            );
  }
  getPriceTypesList(){
    this.receivedPriceTypesList=null;
    this.loadSpravService.getPriceTypesList(this.formBaseInformation.get('company_id').value)
    .subscribe(
      (data) => {
        this.receivedPriceTypesList=data as any [];
        this.necessaryActionsBeforeGetChilds();
      },
        error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
    );
  }
  getSpravSysNds(){
      this.loadSpravService.getSpravSysNds()
        .subscribe((data) => {
          this.spravSysNdsSet=data as any[];
          this.necessaryActionsBeforeGetChilds();
        },
        error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
  }

//******************************************************************************************************************************************/
//*******************************           В Ы Б О Р  С Т Р А Н Ы,  Р А Й О Н А,  Г О Р О Д А       ***************************************/
//******************************************************************************************************************************************/
  //фильтрация при каждом изменении в поле Страна
  private filter_country(value: string): IdAndName_ru[] {
    const filterValue = value.toLowerCase();
    return this.spravSysCountries.filter(option => option.name_ru.toLowerCase().includes(filterValue));
  }  
  getSpravSysCountries():void {    
    this.http.post('/api/auth/getSpravSysCountries', {})  // 
    .subscribe((data) => {
      this.spravSysCountries = data as IdAndName_ru[];
      // this.spravSysJrCountries = data as IdAndName[];
    this.updateValuesSpravSysCountries(); },
    error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
    }
  //если значение уже выбрано (id загрузилось), надо из массива объектов найти имя, соответствующее этому id 
  updateValuesSpravSysCountries(){
    if(+this.formBaseInformation.get('country_id').value!=0)
      {
        this.spravSysCountries.forEach(x => {
          if(x.id==this.formBaseInformation.get('country_id').value){
            this.formBaseInformation.get('country').setValue(x.name_ru);
          }
        })
      } 
      else //иначе обнулить поля id и имени. Без этого при установке курсора в поле список выскакивать не будет (х.з. почему так)
      {
        this.formBaseInformation.get('country').setValue('');
        this.formBaseInformation.get('country_id').setValue('');
      }
      this.necessaryActionsBeforeAutoCreateNewDock();
  }
  //вызывается из html. необходима для сброса уже имеющегося значения. когда имя стирается, в id установится 0 
  checkEmptyCountryField(){
    if( this.formBaseInformation.get('country').value.length==0){
      this.formBaseInformation.get('country_id').setValue('');
    }
  }
  
  //  -----------------------     ***** поиск по подстроке для Региона  ***    --------------------------
  onRegionSearchValueChanges(){
    this.searchRegionCtrl.valueChanges
    .pipe( 
      debounceTime(500),
      tap(() => {
        this.filteredRegions = [];}),       
      switchMap(fieldObject =>  
        this.getSpravSysRegions()))
    .subscribe(data => {
      this.isRegionListLoading = false;
      if (data == undefined) {
        this.filteredRegions = [];
      } else {
        this.filteredRegions = data as Region[];
  }});}
  onSelectRegion(id:number,country_id:number,country:string){
    this.formBaseInformation.get('region_id').setValue(+id);
    //если выбрали регион, а страна не выбрана
    if((this.formBaseInformation.get('country_id').value==null || this.formBaseInformation.get('country_id').value=='') && country_id>0){
      this.formBaseInformation.get('country_id').setValue(country_id);
      this.formBaseInformation.get('country').setValue(country);
    }
  }
  checkEmptyRegionField(){
    if(this.searchRegionCtrl.value.length==0){
      this.formBaseInformation.get('region_id').setValue(null);
  }};     
  getSpravSysRegions(){ //заполнение Autocomplete
    try {
      if(this.canRegionAutocompleteQuery && this.searchRegionCtrl.value.length>1){
        const body = {
          "searchString":this.searchRegionCtrl.value,
          "id":this.formBaseInformation.get('country_id').value};
        this.isRegionListLoading  = true;
        return this.http.post('/api/auth/getSpravSysRegions', body);
      }else return [];
    } catch (e) {
      return [];}}
  //---------------------------------------------------------------------------------------------------
  //---------------     ***** поиск по подстроке для Города  ***    -----------------------------------
  onCitySearchValueChanges(){
    this.searchCityCtrl.valueChanges
    .pipe( 
      debounceTime(500),
      tap(() => {
        this.filteredCities = [];}),       
      switchMap(fieldObject =>  
        this.getSpravSysCities()))
    .subscribe(data => {
      this.isCityListLoading = false;
      if (data == undefined) {
        this.filteredCities = [];
      } else {
        this.filteredCities = data as City[];
  }});}
  onSelectCity(id:any,area:string,region_id:number,region:string,country_id:number,country:string){
    this.formBaseInformation.get('city_id').setValue(+id);
    this.area=area;
    if(area!=''){
      setTimeout(()=> {
        this.searchCityCtrl.setValue(this.searchCityCtrl.value+' ('+area+')'); 
      },200); 
    }//если выбрали город, а регион не выбран
    if((this.formBaseInformation.get('region_id').value==null || this.formBaseInformation.get('region_id').value=='') && region_id>0){//если у города есть регион и он не выбран - устанавливаем регион
      this.formBaseInformation.get('region_id').setValue(region_id);
      this.searchRegionCtrl.setValue(region);
    }//если выбрали регион, а страна не выбрана
    if((this.formBaseInformation.get('country_id').value==null || this.formBaseInformation.get('country_id').value=='') && country_id>0){//если у города есть страна и она не выбрана - устанавливаем страну
      this.formBaseInformation.get('country_id').setValue(country_id);
      this.formBaseInformation.get('country').setValue(country);
    }
  }
  checkEmptyCityField(){
    if(this.searchCityCtrl.value.length==0){
      this.formBaseInformation.get('city_id').setValue(null);
      this.area='';
  }};     
  getSpravSysCities(){ //заполнение Autocomplete
    try {
      if(this.canCityAutocompleteQuery && this.searchCityCtrl.value.length>1){
        const body = {
          "searchString":this.searchCityCtrl.value,
          "id":this.formBaseInformation.get('country_id').value,
          "id2":this.formBaseInformation.get('region_id').value}
        this.isCityListLoading  = true;
        return this.http.post('/api/auth/getSpravSysCities', body);
      }else return [];
    } catch (e) {
      return [];}}    

//*****************************************************************************************************************************************/
//***************************************************    добавление файлов          *******************************************************/
//*****************************************************************************************************************************************/
/*
  openDialogAddFiles() {
    const dialogRef = this.dialogAddFiles.open(FilesComponent, {
      maxWidth: '95vw',
      maxHeight: '95vh',
      height: '95%',
      width: '95%',
      data:
      { 
        mode: 'select',
        companyId: this.formBaseInformation.get('company_id').value
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if(result)this.addFilesToCustomersOrders(result);
    });
  }
  openFileCard(dockId:number) {
    const dialogRef = this.dialogAddFiles.open(FilesDockComponent, {
      maxWidth: '95vw',
      maxHeight: '95vh',
      height: '95%',
      width: '95%',
      data:
      { 
        mode: 'window',
        dockId: dockId
      },
    });
  }
  
  addFilesToCustomersOrders(filesIds: number[]){
    const body = {"id1":this.id, "setOfLongs1":filesIds};// передаем id товара и id файлов 
            return this.http.post('/api/auth/addFilesToCustomersOrders', body) 
              .subscribe(
                  (data) => {  
                    this.openSnackBar("Изображения добавлены", "Закрыть");
                    this.loadFilesInfo();
                            },
                  error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})},
              );
  }
  loadFilesInfo(){//                                     загружает информацию по картинкам товара
    const body = {"id":this.id};//any_boolean: true - полные картинки, false - их thumbnails
          return this.http.post('/api/auth/getListOfCustomersOrdersFiles', body) 
            .subscribe(
                (data) => {  
                            this.filesInfo = data as any[]; 
                            this.loadMainImage();
                          },
                error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})},
            );
  }
  clickBtnDeleteFile(id: number): void {
    const dialogRef = this.ConfirmDialog.open(ConfirmDialog, {
      width: '400px',
      data:
      { 
        head: 'Удаление файла',
        query: 'Удалить файл из заказа покупателя?',
        warning: 'Файл не будет удалён безвозвратно, он останется в библиотеке "Файлы".',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result==1){this.deleteFile(id);}
    });        
  }

  deleteFile(id:number){
    const body = {id: id, any_id:this.id}; 
    return this.http.post('/api/auth/deleteCustomersOrdersFile',body)
    .subscribe(
        (data) => {   
                    this.openSnackBar("Успешно удалено", "Закрыть");
                    this.loadFilesInfo();
                },
        error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})},
    );  
  }
*/
//устанавливает цвет статуса (используется для цветовой индикации статусов)
  setStatusColor():void{
    this.receivedStatusesList.forEach(m=>
      {
        if(m.id==+this.formBaseInformation.get('status_id').value){
          this.formBaseInformation.get('status_color').setValue(m.color);
        }
      });
    }
  getUUID(): string {
    return (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, (c: any) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
    //**************************** КАССОВЫЕ ОПЕРАЦИИ  ******************************/

  onClickOpenShift(){
    this.operationId='openShift';
    this.operationName='Открытие смены';
    this.getShiftStatus();
  }  
  onClickCloseShift(){
    this.operationId='closeShift';
    this.operationName='Закрытие смены';
    this.getShiftStatus();
  }  
  onClickKassaSettings(){
    this.operationId='kassaSettings';
    this.operationName='Настройки';
  }
  onClickPrintXreport(){
    let response: any;
    let uuid: string = this.getUUID();
    // this.operationId='closeShift';
    // this.operationName='Закрытие смены';
    this.kassa_status="Отправка запроса на печать Х-отчета";
    this.kkmAtolService.printXreport(this.server_address,uuid,this.device_server_uid,this.cashierFio,this.cashierVatin).subscribe(
      (data) => {
        response=data as any;
        console.log("Статус запроса на печать Х-отчета - "+response.status);
        if(+response.status>=200 && +response.status<300){
          //Задание успешно добавлено в очередь выполнения для ККМ
          console.log('Задание успешно добавлено в очередь выполнения для ККМ');
          //Проверка исполнения задания
          this.getTaskStatus(uuid,1,1000);
        }else{ 
          switch(response.status){
            case 401:{this.kassa_status="Ошибка: Авторизация не пройдена";break;};
            case 403:{this.kassa_status="Ошибка: ККМ не активирована";break;};
            case 404:{this.kassa_status="Ошибка: ККМ по заданному идентификатору не найдена или ККМ по умолчанию не выбрана";break;};
            case 408:{this.kassa_status="Ошибка: За 30 секунд не удалось захватить управление драйвером (занят фоновыми непрерываемыми задачами). Повторите запрос позже.";break;};
            case 409:{this.kassa_status="Ошибка: Задание с таким же uuid уже существует";break;};
            case 420:{this.kassa_status="Ошибка: Произошла ошибка во время проверки формата задания";break};
            default:{this.kassa_status="Ошибка: Неизвестная ошибка";};
          }
          console.log(this.kassa_status);
        }
      }, error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
  }
  getShiftStatus(onStart?:boolean){
    this.kkmAtolService.queryShiftStatus(this.server_address,'status',this.device_server_uid).subscribe(
      (data) => {
        let response=data as any;
        try{
          console.log("Статус смены-"+response.shiftStatus.state);
          //если при выполнении данной строки происходит ошибка, значит загрузился JSON не по статусу 200, а сервер сгенерировал ошибку и статус 401, 403 или 404.
          //тогда в catch запрашиваем уточненный статус http запроса (4ХХ) и расшифровываем ошибку
          this.shiftStatusId=response.shiftStatus.state;
          switch(this.shiftStatusId){
            case "closed":{this.shift_status="Смена закрыта";break;}
            case "opened":{this.shift_status="Смена открыта";break;}
            case "expired":{this.shift_status="Смена открыта но истекла (превысила 24 часа). Для открытия новой смены закройте текущую.";break;}
          }
          if(onStart){
            if(this.shiftStatusId=="expired"){
              this.operationId='closeShift';
              this.operationName='Закрытие смены';
            }else{
              this.operationId='sell';
              this.operationName='Чек прихода';
            }
          }
        } catch (e) {
          console.log("Код статуса не = 200");
          console.log("Запрос кода ошибки...");
          this.operationId='error';
          this.operationName='Ошибка ККМ';
          this.shift_status="Запрос кода ошибки...";
          //ошибки тоже возворащают объект, в котором может содержаться детальное описание ошибки:
          let errorMessage:string=response.error.description;
          this.kkmAtolService.queryShiftStatus(this.server_address,'errorCode',this.device_server_uid).subscribe((data) => {
            let response=data as any;
            switch(response){
              case 401:{this.shift_status="Ошибка: Авторизация не пройдена";break;};
              case 403:{this.shift_status="Ошибка: ККМ не активирована";break;};
              case 404:{this.shift_status="ККМ по заданному идентификатору не найдена или ККМ по умолчанию не выбрана";break;};
              case 408:{this.shift_status="За 30 секунд не удалось захватить управление драйвером (занят фоновыми непрерываемыми задачами). Повторите запрос позже";break;};
              default:{this.shift_status="Ошибка при выполнении запроса";};//420
              this.shift_status=this.shift_status+'. '+errorMessage;
            }
          }, error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
        }
      }, error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:'Нет связи с сервером "Атол web-сервер"'}})});
  }  
  openShift(){
    let response: any;
    let uuid: string = this.getUUID();
    this.operationName='Открытие смены';
    this.kassa_status="Отправка запроса на открытие смены...";
    this.kkmAtolService.openShift(this.server_address,uuid,this.device_server_uid,this.cashierFio,this.cashierVatin).subscribe(
      (data) => {
        response=data as any;
        console.log("Статус открытия смены - "+response.status);
        if(+response.status>=200 && +response.status<300){
          //Задание успешно добавлено в очередь выполнения для ККМ
          console.log('Задание успешно добавлено в очередь выполнения для ККМ');
          //Проверка исполнения задания
          this.getTaskStatus(uuid,1,1000);
        }else{ 
          switch(response.status){
            case 401:{this.kassa_status="Ошибка: Авторизация не пройдена";break;};
            case 403:{this.kassa_status="Ошибка: ККМ не активирована";break;};
            case 404:{this.kassa_status="Ошибка: ККМ по заданному идентификатору не найдена или ККМ по умолчанию не выбрана";break;};
            case 408:{this.kassa_status="Ошибка: За 30 секунд не удалось захватить управление драйвером (занят фоновыми непрерываемыми задачами). Повторите запрос позже.";break;};
            case 409:{this.kassa_status="Ошибка: Задание с таким же uuid уже существует";break;};
            case 420:{this.kassa_status="Ошибка: Произошла ошибка во время проверки формата задания";break;};
            default:{this.kassa_status="Ошибка: Неизвестная ошибка";};
          }
          console.log(this.kassa_status);
        }
      }, error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
  }  

  closeShift(){
    let response: any;
    let uuid: string = this.getUUID();
    this.operationId='closeShift';
    this.operationName='Закрытие смены';
    this.kassa_status="Отправка запроса на закрытие смены";
    this.kkmAtolService.closeShift(this.server_address,uuid,this.device_server_uid,this.cashierFio,this.cashierVatin).subscribe(
      (data) => {
        response=data as any;
        console.log("Статус открытия смены - "+response.status);
        if(+response.status>=200 && +response.status<300){
          //Задание успешно добавлено в очередь выполнения для ККМ
          console.log('Задание успешно добавлено в очередь выполнения для ККМ');
          //Проверка исполнения задания
          this.getTaskStatus(uuid,1,1000);
        }else{ 
          switch(response.status){
            case 401:{this.kassa_status="Ошибка: Авторизация не пройдена";break;};
            case 403:{this.kassa_status="Ошибка: ККМ не активирована";break;};
            case 404:{this.kassa_status="Ошибка: ККМ по заданному идентификатору не найдена или ККМ по умолчанию не выбрана";break;};
            case 408:{this.kassa_status="Ошибка: За 30 секунд не удалось захватить управление драйвером (занят фоновыми непрерываемыми задачами). Повторите запрос позже.";break;};
            case 409:{this.kassa_status="Ошибка: Задание с таким же uuid уже существует";break;};
            case 420:{this.kassa_status="Ошибка: Произошла ошибка во время проверки формата задания";break};
            default:{this.kassa_status="Ошибка: Неизвестная ошибка";};
          }
          console.log(this.kassa_status);
        }
      }, error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
  } 
  testKassaConnect(){
    this.wasConnectionTest=true;
    this.requestToServer=true;
    this.test_status= '';
    this.kkmAtolService.queryDeviceInfo(this.server_address_temp,'info',this.device_server_uid_temp).subscribe(//параметры: 1й - запрос информации (может быть еще запрос кода ошибки), 2й - id кассы в сервере Атола
      (data) => {
        let response=data as any;
        try{
          //если при выполнении данной строки происходит ошибка, значит загрузился JSON не по статусу 200, а сервер сгенерировал ошибку и статус 401, 403 или 404.
          //тогда в catch запрашиваем уточненный статус http запроса (4ХХ) и расшифровываем ошибку
          let tryNotToCatchTheError = response.deviceInfo.modelName;
          this.requestToServer=false;
          this.test_status='Соединение установлено!';
        } catch (e) {
          this.test_status="Ошибка связи с кассой. Запрос кода ошибки..."
          this.requestToServer=true;
          let errorMessage:string=response.error.description;//ошибки тоже возворащают объект, в котором может содержаться детальное описание ошибки
          if(errorMessage=='Порт недоступен'||errorMessage=='Нет связи') errorMessage=errorMessage+'. Проверьте, включена ли касса и подключена ли она к компьютеру.'
          this.kkmAtolService.queryShiftStatus(this.server_address_temp,'errorCode',this.device_server_uid_temp).subscribe((data) => {
            this.requestToServer=false;
            let response=data as any;
            switch(response){
              case 401:{this.test_status="Ошибка: Авторизация не пройдена";break;};
              case 403:{this.test_status="Ошибка: ККМ не активирована";break;};
              case 404:{this.test_status="ККМ по заданному идентификатору не найдена или ККМ по умолчанию не выбрана";break;};
              case 408:{this.test_status="За 30 секунд не удалось захватить управление драйвером (занят фоновыми непрерываемыми задачами). Повторите запрос позже";break;};
              default :{this.test_status="Ошибка при выполнении запроса";};//420
              console.log(this.test_status);
              this.test_status=this.test_status+'. '+errorMessage;
            }
          }, error => {console.log(error);this.requestToServer=false;});
        }
      }, error => {console.log(error);this.requestToServer=false;this.test_status= 'Нет связи с сервером';});
  }
  onClickReceipt(receiptTypeId:string,receiptTypeName:string){
    this.operationId=receiptTypeId;
    this.operationName=receiptTypeName;
    this.kassa_status='';
  }
  // перед печатью чека проверяем на дабл-клик и повторную отправку.
  checkAndPrintReceipt(){
    let receiptIsPrinted:boolean;
    if(this.settingsForm.get('selectedPaymentType').value=='electronically'){
      this.bnal_income=this.getTotalSumPrice();
    }
    switch (this.operationId){
      case 'sell':{if(this.sellReceiptIsPrinted) receiptIsPrinted=true; break;}
      case 'buy':{if(this.buyReceiptIsPrinted) receiptIsPrinted=true; break;}
      case 'sellReturn':{if(this.sellReturnReceiptIsPrinted) receiptIsPrinted=true; break;}
      case 'buyReturn':{if(this.buyReturnReceiptIsPrinted) receiptIsPrinted=true; break;}
      case 'sellCorrection':{if(this.sellCorrectionReceiptIsPrinted) receiptIsPrinted=true; break;}
      case 'buyCorrection':{if(this.buyCorrectionReceiptIsPrinted) receiptIsPrinted=true; break;}
      case 'sellReturnCorrection':{if(this.sellReturnCorrectionReceiptIsPrinted) receiptIsPrinted=true; break;}
      case 'buyReturnCorrection':{if(this.buyReturnCorrectionReceiptIsPrinted) receiptIsPrinted=true; break;}
    }
    if(receiptIsPrinted){
      const dialogRef = this.ConfirmDialog.open(ConfirmDialog, {
        width: '400px',
        data:
        { 
          head: 'Попытка повторного отбития чека "'+this.operationName+'"',
          warning: 'Отбить '+this.operationName+' ещё раз?',
          query: 'Чек данного типа уже отправлялся на регистрацию из данного документа. Возможно, вы сделали двойной клик по кнопке "Отбить чек"',
        },
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result==1){
          this.printReceipt();
        }
      });  
    } else this.printReceipt();
  }
  // отправка на печать чека прихода/расхода/коррекции
  printReceipt(){
    let response: any;
    let uuid: string = this.getUUID();
    let cheque:any; //объект чека
    let chequeItem: any; //объект позиции в чеке
    let textItem: any //объект дополнительного элемента для вывода до печати документа
    let dividerItem: any = this.kkmAtolChequesService.getDividerItem(); //объект разделителя позиций в чеке
    let payment: any; //объект оплаты в чеке
    switch(this.operationId){
      case 'sell':{cheque=this.kkmAtolChequesService.getCheque();break;}
      default :{cheque=this.kkmAtolChequesService.getCorrectionCheque11();break;}
    }
    
    console.log(this.kassa_status);
    // конструирование чека из его составляющих (сервис KkmAtolChequesService):
    cheque.uuid=uuid; 
    cheque.request[0].type=this.operationId;//операция (sell,buy и т.д.)
    cheque.request[0].taxationType=this.sno1_name_api_atol;//система налогообложения кассы (из паспорта кассы)
    cheque.request[0].paymentsPlace=this.billingAddress;//место расчетов
    cheque.request[0].operator.name=this.cashierFio;
    cheque.request[0].operator.vatin=this.cashierVatin;
    //название чека (т.к. касса не всегда выводит название чека).
    textItem=this.kkmAtolChequesService.getTextItem();
    textItem.text=this.operationName;
    textItem.alignment='center';
    textItem.doubleWidth=true;
    cheque.request[0].preItems.push(textItem);
    //параметры только для чека коррекции
    if(this.operationId=='sellCorrection'||this.operationId=='buyCorrection'||this.operationId=='sellReturnCorrection'||this.operationId=='buyReturnCorrection'){
      cheque.request[0].correctionType=this.correctionType;
      cheque.request[0].correctionBaseDate=moment(this.correctionBaseDate).format('YYYY.MM.DD').toString();//кассе нужна дата в формате YYYY.MM.DD
      cheque.request[0].correctionBaseNumber=this.correctionBaseNumber;
      textItem=this.kkmAtolChequesService.getTextItem();
      textItem.alignment='center';
      textItem.text='Параметры коррекции:';
      cheque.request[0].postItems.push(textItem);
      textItem=this.kkmAtolChequesService.getTextItem();
      textItem.alignment='left';
      textItem.text='Дата коррекции: '+moment(this.correctionBaseDate).format('DD.MM.YYYY').toString();
      cheque.request[0].postItems.push(textItem);
      textItem=this.kkmAtolChequesService.getTextItem();
      textItem.text='Тип коррекции: '+(this.correctionType=='self'?'Самостоятельно':'По предписанию');
      cheque.request[0].postItems.push(textItem);
      if(this.correctionType=='instruction'){
        textItem=this.kkmAtolChequesService.getTextItem();
        textItem.text='Номер предписания: '+this.correctionBaseNumber;
        cheque.request[0].postItems.push(textItem);
      } 
      if(this.correctionCommentary.length>0){
        textItem=this.kkmAtolChequesService.getTextItem();
        textItem.text='Комментарий: '+this.correctionCommentary;
        cheque.request[0].postItems.push(textItem);
      }
    }
    //товарные позиции
    this.formBaseInformation.controls.customersOrdersProductTable.value.forEach(row => {
      cheque.request[0].items.push(dividerItem);
      chequeItem=this.kkmAtolChequesService.getChequeItem();
      chequeItem.type='position';
      chequeItem.name=row.name;
      chequeItem.price=+row.product_price;
      chequeItem.quantity=+row.product_count;
      chequeItem.amount=+row.product_sumprice;
      chequeItem.department=1;
      chequeItem.paymentMethod='fullPayment';     
      chequeItem.paymentObject=row.ppr_name_api_atol;       //Признак предмета расчета - Товар/Услуга/Работа и т.д.
      chequeItem.tax.type= this.cheque_nds?this.getNdsApiAtolName(+row.nds_id):'none';                 //НДС
      cheque.request[0].items.push(chequeItem);
    });
    cheque.request[0].items.push(dividerItem);
    payment=this.kkmAtolChequesService.getPayment();
    switch(this.settingsForm.get('selectedPaymentType').value){
      case "cash":{
        payment.type= 'cash';
        payment.sum=+this.nal_income;
        cheque.request[0].payments.push(payment);
        break;
      }
      case "electronically":{
        payment.type= 'electronically';
        payment.sum=+this.bnal_income;
        cheque.request[0].payments.push(payment);
        break;
      }
      case "mixed":{
        payment.type= 'cash';
        payment.sum=+this.nal_income;
        cheque.request[0].payments.push(payment);
        payment=this.kkmAtolChequesService.getPayment();
        payment.type= 'electronically';
        payment.sum=+this.bnal_income;
        cheque.request[0].payments.push(payment);
        break;
      }
    }
    this.kassa_status="Отправка запроса на печать чека";
    this.kkmAtolService.receipt(cheque).subscribe(
      (data) => {
        response=data as any;
        console.log("Статус запроса по отправке чека на очередь печати - "+response.status);
        if(+response.status>=200 && +response.status<300){
          //Задание успешно добавлено в очередь выполнения для ККМ
          console.log('Задание успешно добавлено в очередь выполнения для ККМ');
          //Проверка исполнения задания
          this.getTaskStatus(uuid,1,1000);
          //отмечаем что чек отправляли на отбивание
          switch (this.operationId){
            case 'sell':{this.sellReceiptIsPrinted=true; break;}
            case 'buy':{this.buyReceiptIsPrinted=true; break;}
            case 'sellReturn':{this.sellReturnReceiptIsPrinted=true; break;}
            case 'buyReturn':{this.buyReturnReceiptIsPrinted=true; break;}
            case 'sellCorrection':{this.sellCorrectionReceiptIsPrinted=true; break;}
            case 'buyCorrection':{this.buyCorrectionReceiptIsPrinted=true; break;}
            case 'sellReturnCorrection':{this.sellReturnCorrectionReceiptIsPrinted=true; break;}
            case 'buyReturnCorrection':{this.buyReturnCorrectionReceiptIsPrinted=true; break;}
          }
        }else{ 
          switch(response.status){
            case 401:{this.kassa_status="Ошибка: Авторизация не пройдена";break;};
            case 403:{this.kassa_status="Ошибка: ККМ не активирована";break;};
            case 404:{this.kassa_status="Ошибка: ККМ по заданному идентификатору не найдена или ККМ по умолчанию не выбрана";break;};
            case 408:{this.kassa_status="Ошибка: За 30 секунд не удалось захватить управление драйвером (занят фоновыми непрерываемыми задачами). Повторите запрос позже.";break;};
            case 409:{this.kassa_status="Ошибка: Задание с таким же uuid уже существует";break;};
            case 420:{this.kassa_status="Ошибка: Произошла ошибка во время проверки формата задания";break};
            default:{
              this.kassa_status="Ошибка: Неизвестная ошибка";
            };
          }
          console.log(this.kassa_status);
        }
      }, 
      error => {
        console.log(error);
        this.kassa_status="Ошибка связи с сервером. Проверьте, запущен ли сервер Атол"
      }
    );
  } 

  //получает результат задания
	getTaskStatus(uuid:string,cnt:number,time:number)
	{
    let maxTrying=3;
    let responseStatus:string;
    let response: any = null;
    this.kassa_status="Ожидание выполнения задания...";
    console.log("Попытка "+cnt);
    this.sleep(time)
    .then(() => {
      console.log("запрос... ");
      
      this.kkmAtolService.getTaskStatus(uuid).subscribe(data => {
        response=data as any;
        try{
          console.log("Статус задания-"+response.results[0].status);

          //если при выполнении данной строки происходит ошибка, значит загрузился JSON не по статусу 200, а сервер сгенерировал ошибку и статус 401, 403 или 404.
          //тогда в catch запрашиваем уточненный статус и ошибку
          responseStatus=response.results[0].status;
          
          switch(responseStatus){
            case "ready":{
              this.kassa_status="Задание выполнено без ошибок. ";
              this.getShiftStatus(); // для обновления состояния смены. Если запрос был по открытию или закрытию смены - статус смены обновится
              //если это был чек прихода, и в настройках стоит Автосоздание после печати чека прихода - создаем новый док
              if(this.operationId=='sell' && this.settingsForm.get('autocreateOnCheque').value){
                //сначала установим статус из настроек при автосоздании перед сохранением
                this.formBaseInformation.get('status_id').setValue(this.settingsForm.get('statusIdOnAutocreateOnCheque').value);
                //потом сохраним:
                if(this.updateDocument(true)){
                  this._router.navigate(['ui/customersordersdock']);
                  this.openSnackBar("Чек был успешно напечатан. Создание нового Заказа покупателя", "Закрыть");
                }
                
              }
              break;
            }
            case "error":{
              this.kassa_status="Задание выполнено с ошибкой: "+response.results[0].error.description;
              if(response.results[0].error.description=="Превышение длины реквизита") 
                this.kassa_status=this.kassa_status+". Возможно, введён неверный ИНН";
              break;
            }
            case "wait":{
              this.kassa_status="Задание ожидает выполнения. ";
              break;
            }
            case "inProgress":{
              this.kassa_status="Задание выполняется. ";
              break;
            }
            case "interrupted ":{
              this.kassa_status="Задание не выполнялось, т.к. предыдущие задания выполнены с ошибкой. ";
              break;
            }
            case "blocked":{
              this.kassa_status="Задание результат задания неизвестен, очередь выполнения остановлена. ";
              break;
            }
            case "canceled":{
              this.kassa_status="Задание прервано. ";
              break;
            }
          }
          this.cdRef.detectChanges();
          if (cnt<=maxTrying && (responseStatus=='wait' || responseStatus=='inProgress')){
            cnt++;
            console.log("Макс. количество попыток не использовано, статус - wait или inProgress")
            // alert('повторяем...');
            this.getTaskStatus(uuid,cnt,2000)
          } 
          // if( (cnt>maxTrying){

          // }

        } catch (e) {
          console.log("Код статуса не = 200");
          console.log("Запрос кода ошибки...");
          this.getTaskErrorCode(uuid);
        }
      }, error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
    });
  }

  getTaskErrorCode(uuid:string){
    this.kkmAtolService.getTaskCode(uuid).subscribe((data) => {
      let response=data as any;
      switch(response){
        case 401:{
          this.kassa_status="Ошибка: Авторизация не пройдена";
          break;
        };
        case 403:{
          this.kassa_status="Ошибка: ККМ не активирована";
          break;
        };
        default:{
          this.kassa_status="Ошибка: ККМ по заданному идентификатору не найдена, или ККМ по умолчанию не выбрана, или задание с указанным UUID не найдено";
        };
        console.log(this.kassa_status);
      }
    }, error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})});
  }
  onSelectedPaymentType(paymentType:string){
    this.bnal_income='';
    this.nal_income='';
    switch(paymentType){
      case 'cash':{
        this.settingsForm.get('selectedPaymentType').setValue('cash');
        break;
      };
      case 'electronically':{
        this.settingsForm.get('selectedPaymentType').setValue('electronically');
        this.bnal_income=this.getTotalSumPrice();
        break;
      };
      case 'mixed':{
        this.settingsForm.get('selectedPaymentType').setValue('mixed');
        break;
      };
    }
  }
  //расчет сдачи
  getChange():string{
    //сдача равна сумме внесенной в кассу наличности и оплаченного безнала, минус стоимость покупки:
    let change:number=(+this.nal_income + (+this.bnal_income))-(+this.getTotalSumPrice());
    return (change<0?0:change).toFixed(2);
  }
  getMyShortInfo(){
    this.loadSpravService.getMyShortInfo()
    .subscribe(
        (data) => {
          this.userInfo=data as any;
          this.getKassaListByDepId();//загружаем список доступных касс
        },
        error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
    );
  }
  //вход в систему другого кассира
  cashierLogin(){
    let isUserCanWorkWithKKM: boolean;
    let user: any;
    this.loadSpravService.isUserCanWorkWithKKM(this.loginform.get('username').value,this.loginform.get('password').value,)
    .subscribe(
        (data) => {
          isUserCanWorkWithKKM=data as boolean;
          if(isUserCanWorkWithKKM){

            this.loadSpravService.getUserByLoginInfo(this.loginform.get('username').value,this.loginform.get('password').value,)
            .subscribe(
                (data) => {
                  user=data as any;
                  this.anotherCashierFio=user.name;
                  this.anotherCashierVatin=user.vatin;
                  Cookie.set('anotherCashierFio',this.anotherCashierFio);
                  Cookie.set('anotherCashierVatin',this.anotherCashierVatin);
                  this.formCashierLogin.resetForm();
                  this.openSnackBar("Вход выполнен", "Закрыть");
                },
                error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
            );

          } else {
            this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка аутентификации!',message:'Неправильные логин или пароль, либо пользователь не имеет статус "Активный", либо пользователь не из этого предприятия.'}});
            this.kassaSettingsForm.get('cashier_value_id').setValue('current');
            this.cashierFio='';
            this.cashierVatin='';
            this.onCashierTypeChange();
          }
        },
        error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
    );
  }
  onCashierTypeChange(){
    this.anotherCashierIsLoggedIn=false;
    this.wasConnectionTest=false;
    switch(this.kassaSettingsForm.get('cashier_value_id').value){
      case 'current':{//кассир - текущая учетная запись
        this.kassaSettingsForm.get("customCashierFio").disable();
        this.kassaSettingsForm.get("customCashierVatin").disable();
        break;
      }
      case 'another':{//кассир - другая учетная запись
        this.kassaSettingsForm.get("customCashierFio").disable();
        this.kassaSettingsForm.get("customCashierVatin").disable();
        break;
      }
      case 'custom':{ //кассир - произвольные ФИО и ИНН
        this.kassaSettingsForm.get("customCashierFio").enable();
        this.kassaSettingsForm.get("customCashierVatin").enable();
      }
    }
  }
  //устанавлиает финальные ФИО и ИНН кассира, которые будут выводиться в чек
  setCashierFioAndVatin(){
    switch(this.kassaSettingsForm.get('cashier_value_id').value){
      case 'current':{//кассир - текущая учетная запись
        this.cashierFio=this.userInfo.name;
        this.cashierVatin=this.userInfo.vatin;
        break;
      }
      case 'another':{//кассир - другая учетная запись
        this.cashierFio=this.anotherCashierFio;
        this.cashierVatin=this.anotherCashierVatin;
        break;
      }
      case 'custom':{ //кассир - произвольные ФИО и ИНН
        this.cashierFio=this.kassaSettingsForm.get('customCashierFio').value;
        this.cashierVatin=this.kassaSettingsForm.get('customCashierVatin').value;
      }
    }
  }
  onBillingAddressChange(){//вызывается поочередно из 
    switch(this.kassaSettingsForm.get('billing_address').value){
      case 'settings':{// - как в настройках кассы
        this.kassaSettingsForm.get("custom_billing_address").disable();
        this.billingAddress=this.kassa_billing_address;
        break;
      }
      case 'customer':{// - брать из адреса заказчика
        this.kassaSettingsForm.get("custom_billing_address").disable();
        this.billingAddress=this.addressString;
        break;
      }
      case 'custom':{ // - произвольный адрес
        this.kassaSettingsForm.get("custom_billing_address").enable();
        this.billingAddress=this.kassaSettingsForm.get("custom_billing_address").value;
      }
    }
  }
 //сохраняет настройки кассира
  updateCashierSettings(){
    this.wasConnectionTest=false;
    return this.http.post('/api/auth/updateCashierSettings',  this.kassaSettingsForm.value)
      .subscribe(
          (data) => 
          {   
            this.openSnackBar("Настройки кассы сохранены", "Закрыть");
            //проверка верны ли настройки и можно ли работать с кассой после сохранения настроек
            this.operationId='undefined';
            this.getKassaListByDepId();
            if(this.kassaSettingsForm.get('cashier_value_id').value!='another'){
              this.anotherCashierFio='';
              this.anotherCashierVatin='';
              // this.anotherCashierIsLoggedIn=false;
              Cookie.set('anotherCashierFio','');
              Cookie.set('anotherCashierVatin','');
              // alert("Cookie.get('anotherCashierFio')-"+Cookie.get('anotherCashierFio')+", Cookie.get('anotherCashierVatin')-"+Cookie.get('anotherCashierVatin'));
              
            }
            
          },
          error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})},
      );
  }
  //загружает список касс для кассира по id отделения
  getKassaListByDepId(){
    this.http.get('/api/auth/getKassaListByDepId?id='+this.formBaseInformation.get('department_id').value)
      .subscribe(
          (data) => 
          {   
            this.kassaList=data as KassaList[];
            this.getKassaCashierSettings();
          },
          error => {console.log(error);this.MessageDialog.open(MessageDialog,{width:'400px',data:{head:'Ошибка!',message:error.error}})}
      );
  }
//загрузка настроек кассира
  getKassaCashierSettings(){
    this.http.get('/api/auth/getKassaCashierSettings')
      .subscribe(
          (data) => 
          {   
            this.kassaSettings=data as KassaSettings;
            if(this.kassaSettings.selected_kassa_id){//если настройки для кассы есть
              this.applyKassaCashierSettings(true);
            } else {
              this.kassaSettings.cashier_value_id=this.kassaSettingsForm.get("cashier_value_id").value;//когда еще настроек кассира нет - устанавливается кассир по дефолту (current), чтобы он уже был выбран. Если они есть - переназначится в applyKassaCashierSettings
              this.setCashierFioAndVatin();//Установить ФИО и ИНН для кассира по дефолту (current)
              this.setCanWorkWithKassa(true)
            };
          },
          error => {console.log(error)},
      );
  }
  //применение загруженных настроек кассира и информации о нем
  applyKassaCashierSettings(onStart?:boolean){
    this.kassaSettingsForm.get('selected_kassa_id').setValue(this.kassaSettings.selected_kassa_id);
    this.kassaSettingsForm.get('cashier_value_id').setValue(this.kassaSettings.cashier_value_id);
    this.kassaSettingsForm.get('customCashierFio').setValue(this.kassaSettings.customCashierFio);
    this.kassaSettingsForm.get('customCashierVatin').setValue(this.kassaSettings.customCashierVatin);
    this.kassaSettingsForm.get('billing_address').setValue(this.kassaSettings.billing_address);
    this.kassaSettingsForm.get('custom_billing_address').setValue(this.kassaSettings.custom_billing_address);
    this.getKassaValues();//взять из загруженного списка касс данные для связи и чека по выбранному id кассы
    this.getTemporaryKassaValues();// данные для тестирования связи с кассой.
    this.onCashierTypeChange();//чтобы заэнейблить нужные и задисейблить ненужные поля
    this.setCashierFioAndVatin();//Установить ФИО и ИНН для текущего кассира
    this.setCanWorkWithKassa(onStart);//узнать можно ли сейчас работать с кассой
    this.onBillingAddressChange(); // если адрес места растчетов "Произвольный адрес", он будет =  kassaSettingsForm.get('custom_billing_address')
  }
  //определяет, можно ли пользователю работать с кассой
  setCanWorkWithKassa(onStart?:boolean){
    if(
      +this.kassaSettingsForm.get('selected_kassa_id').value==0 ||//если касса не выбрана
      (this.kassaSettingsForm.get('cashier_value_id').value=='another'&&(this.anotherCashierFio==''||this.anotherCashierVatin==''))||//если выбрано "Другая учетная запись (custom)", но данных по ней нет
      this.cashierFio==''//кассир не выбран
      ) {
      this.canWorkWithKassa=false;
      this.operationId='cantwork';
      this.operationName='Работа с кассой невозможна.';
      // alert(+this.kassaSettingsForm.get('selected_kassa_id').value);
    } else {
      this.canWorkWithKassa=true;
      // this.operationId='sell';
      // this.operationName='Чек прихода';

      //если пользователь может работать с кассой - проверим, может ли работать сама касса))
      this.getShiftStatus(onStart);
    };
    // console.log('canWorkWithKassa - '+this.canWorkWithKassa);
  }
  //берет значения по кассе (server_type, server_address, device_server_uid) из загруженного в getKassaListByDepId списка касс
  getKassaValues(){
    this.kassaList.map(i=>{
      if(i.id==this.kassaSettingsForm.get('selected_kassa_id').value){
        this.server_type=i.server_type; // тип сервера (атол или ккмсервер)
        this.device_server_uid=i.device_server_uid;// уник. идентификатор кассы на сервере
        this.server_address=i.server_address;//адрес сервера в сети
        this.sno1_name_api_atol=i.sno1_name_api_atol; //система налогообложения кассы
        this.company_email=i.company_email; // email предприятия
        this.kassa_billing_address=i.billing_address; // адрес места растчетов
        this.onBillingAddressChange(); // если адрес места растчетов "Как в насройках кассы", он будет kassa_billing_address
      }
    })
  }
  //достает "наименование НДС по системе Атол" из загруженного справочника НДС
  getNdsApiAtolName(nds_id:number):string{
    let name:string='';
    this.spravSysNdsSet.map(i=>{
      if(i.id==nds_id){
        name=i.name_api_atol;
      }
    });
    return name;
  }
  //для тестирования связи с кассой.
  getTemporaryKassaValues(){
    this.kassaList.map(i=>{
      if(i.id==this.kassaSettingsForm.get('selected_kassa_id').value){
        this.server_type_temp=i.server_type; // тип сервера (атол или ккмсервер)
        this.device_server_uid_temp=i.device_server_uid;// уник. идентификатор кассы на сервере
        this.server_address_temp=i.server_address;//адрес сервера в сети
      }
    })
  }
  //при выборе из списка другой кассы берем её параметры для теста связи(адрес сервера и т.п.), а для чеков остается старая касса. Пока не сохраним настройки.
  onKassaSelection(){
    this.wasConnectionTest=false;
    this.getTemporaryKassaValues();
  }
  onClickMenuIcon(){
    this.kassa_status='';
    this.applyKassaCashierSettings();//восстанавливаем настройки в форме (если их не сохранили)
  }
}