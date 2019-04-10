import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatButtonModule, MatToolbarModule, MatNativeDateModule, MatIconModule, MatListModule } from '@angular/material';

const modules = [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatNativeDateModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule
];

@NgModule({
    imports: modules,
    exports: modules
})
export class MaterialModule { }
