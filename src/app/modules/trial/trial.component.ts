import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, map, startWith } from 'rxjs';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trial',
  templateUrl: './trial.component.html',
  styleUrls: ['./trial.component.scss']
})
export class TrialComponent {
  
}