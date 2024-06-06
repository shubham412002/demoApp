import { RegisterService } from './../register.service';
import { Component, Inject, OnInit } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent, MatDialogRef,MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.css']
})
export class ProfileDialogComponent implements OnInit {
  registrationForm: FormGroup;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  states = [];
  countries = [];
  tags = [];

  userId:number;

  userData:any;

  constructor(
    private registerService: RegisterService,
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    private router:Router,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) { 

    this.userData = dialogData;
  }

  ngOnInit() {
    this.registrationForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]{1,20}$')]),
      lastName: new FormControl('', [Validators.required,Validators.pattern('^[a-zA-Z ]+$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      age: new FormControl(20, Validators.required),
      state: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      addressType: new FormControl('', Validators.required),
      address1: new FormControl(''),
      address2: new FormControl(''),
      companyAddress1: new FormControl(''),
      companyAddress2: new FormControl(''),
      tags: new FormArray([]),
      subscribe: new FormControl(false),
      photo: new FormControl(null)
    });

    this.registrationForm.get('addressType').valueChanges.subscribe(value => {
      this.updateAddressValidators(value);
    });

    if (this.dialogData) {
      this.onCountryChange(this.dialogData.country); 
    }


    if(this.userData) {
      this.registrationForm.patchValue({
        firstName: this.userData.firstName,
        lastName: this.userData.lastName,
        email: this.userData.email,
        phone: this.userData.phone,
        age: this.userData.age,
        state: this.userData.state,
        country: this.userData.country,
        addressType: this.userData.addressType,
        address1: this.userData.address1,
        address2: this.userData.address2,
        companyAddress1: this.userData.companyAddress1,
        companyAddress2: this.userData.companyAddress2,
        tags: this.userData.tags,
        subscribe: this.userData.subscribe, 
        photo: this.userData.photo
      })

      this.addExistingTags();
    }

    this.loadCountries();
  }

  loadCountries() {
    this.registerService.getCountries().subscribe(
      (data: any[]) => {
        if(data) {
          this.countries = data;
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  onCountryChange(countryId: number) {
    this.registerService.getStatesByCountryId(countryId).subscribe(
      (data: string[]) => {
        if (data) { 
          this.states = data;
          if (this.dialogData && this.dialogData.state) {
            this.registrationForm.get('state').setValue(this.dialogData.state);
          }
        }
      },
      (error) => {
        console.error('Error fetching states:', error);
      }
    );
  }

  updateAddressValidators(addressType: string) {
    if (addressType === 'home') {
      this.registrationForm.get('address1').setValidators([Validators.required]);
      this.registrationForm.get('address2').setValidators([]);
      this.registrationForm.get('companyAddress1').setValidators([]);
      this.registrationForm.get('companyAddress2').setValidators([]);
    } else if (addressType === 'company') {
      this.registrationForm.get('address1').setValidators([]);
      this.registrationForm.get('address2').setValidators([]);
      this.registrationForm.get('companyAddress1').setValidators([Validators.required]);
      this.registrationForm.get('companyAddress2').setValidators([]);
    } else {
      this.registrationForm.get('address1').setValidators([]);
      this.registrationForm.get('address2').setValidators([]);
      this.registrationForm.get('companyAddress1').setValidators([]);
      this.registrationForm.get('companyAddress2').setValidators([]);
    }

    this.registrationForm.get('address1').updateValueAndValidity();
    this.registrationForm.get('address2').updateValueAndValidity();
    this.registrationForm.get('companyAddress1').updateValueAndValidity();
    this.registrationForm.get('companyAddress2').updateValueAndValidity();
  }



  addExistingTags() {
    const tagsArray = this.registrationForm.get('tags') as FormArray;
    // this.tags.forEach(tag => tagsArray.push(new FormControl(tag)));
    if(this.userData.tags.length) {
      this.userData.tags.forEach(tag => tagsArray.push(new FormControl(tag)));
    }
  }

  get tagsFormArray(): FormArray {
    return this.registrationForm.get('tags') as FormArray;
  }


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.tagsFormArray.push(new FormControl(value.trim()));
    }

    if (input) {
      input.value = '';
    }
  }

  remove(tag: string): void {
    const index = this.tagsFormArray.controls.findIndex(control => control.value === tag);

    if (index >= 0) {
      this.tagsFormArray.removeAt(index);
    }
  }


  onFileSelected(): void {
    document.querySelector<HTMLInputElement>('#fileInput').click();
  }


  onSelectionChange(option) {
    console.log(option)
  }

  uploadPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
  
      if (!file.type.startsWith('image/')) {
        this.registerService.openSnackBar('Please upload a valid image file.', 'Close');
        return;
      }
  
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        img.src = e.target.result;
  
        img.onload = () => {
          if (img.width > 310 || img.height > 325) {
            this.registerService.openSnackBar('Image size should be within 310x325 pixels.', 'Close');
          } else {
            this.registrationForm.get('photo').setValue(e.target.result);
          }
        };
      };
  
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      if(this.userData) {
        this.registerService.updateUser(this.registrationForm.value, this.userData.id).subscribe(
          (response) => {
            if (response) { 
              this.userId = response.id;
              this.registerService.notifyUserUpdated(response);
              this.registerService.openSnackBar('User updated successfully', 'Close');
              this.dialogRef.close();
            }
          },
          (error) => {
            console.log(error);
          }
          )
      } else {
        this.registerService.registerUser(this.registrationForm.value).subscribe(
          (response) => {
            if (response) {
              this.userId = response.id;
              this.registerService.openSnackBar('User registered successfully', 'Close');
              this.dialogRef.close();
            }
          },
          (error) => {
            console.log(error);
          },
          () => {
            this.dialogRef.afterClosed().subscribe(result => {
              this.registerService.getUsers(this.userId).subscribe(user => {
                if(user) {
                  this.router.navigate(['/profile', user.id]);
                }
              })
            })
          }
        )
      }

    }
  }

}
