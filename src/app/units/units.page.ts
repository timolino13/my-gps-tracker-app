import {Component, OnInit} from '@angular/core';
import {UnitsService} from './units.service';
import {Auth, onAuthStateChanged} from '@angular/fire/auth';

@Component({
    selector: 'app-units',
    templateUrl: './units.page.html',
    styleUrls: ['./units.page.scss'],
})
export class UnitsPage implements OnInit {
    unitsList$;

    constructor(private readonly auth: Auth, private readonly unitsService: UnitsService) {
    }

    ngOnInit() {
        this.getUnits();
    }

    getUnits() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.unitsService.getUnits().subscribe(value => {
                        this.unitsList$ = value;
                    }
                );
            }
        });
    }
}
