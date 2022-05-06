import { Component, OnInit } from '@angular/core';
import {UnitsService} from "./units.service";

@Component({
  selector: 'app-units',
  templateUrl: './units.page.html',
  styleUrls: ['./units.page.scss'],
})
export class UnitsPage implements OnInit {

  constructor(private readonly unitsService: UnitsService) { }

  ngOnInit() {
    console.log('units', this.unitsService.getUnits());
  }

}
