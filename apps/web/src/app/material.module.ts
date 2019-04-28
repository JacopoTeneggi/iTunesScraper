import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatNativeDateModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
} from '@angular/material';

const modules = [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatNativeDateModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatExpansionModule
];

@NgModule({
    imports: modules,
    exports: modules
})
export class MaterialModule { }
