import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersordersDockRoutingModule } from './customersorders-dock-routing.module';
import { CustomersordersDockComponent } from './customersorders-dock.component';
import { ControlMessagesComponent } from './control-messages.component';
import { ValidationService } from './validation.service';
import { MaterialModule } from '../../../../modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsCustomersordersDialogModule } from '../../../../modules/settings/settings-customersorders-dialog/settings-customersorders-dialog.module';
import { ProductSearchAndTableModule } from 'src/app/modules/trade-modules/product-search-and-table/product-search-and-table.module';
import { KkmModule } from 'src/app/modules/trade-modules/kkm/kkm.module';

@NgModule({
  declarations: [CustomersordersDockComponent, ControlMessagesComponent],
  imports: [
    CommonModule,
    CustomersordersDockRoutingModule,
    SettingsCustomersordersDialogModule,
    ProductSearchAndTableModule,
    KkmModule,

    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [ValidationService],
})
export class CustomersordersDockModule { }
