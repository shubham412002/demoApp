import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from '../register.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any;
  userId: number;

  states: any[] = []; 

  private userUpdatedSub: Subscription;
  
  constructor(
    private dialog:MatDialog,
    private router:Router,
    private route: ActivatedRoute,
    private registerService: RegisterService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.userId) {
      this.getUserDetails(this.userId);
    }

    this.userUpdatedSub = this.registerService.getUserUpdateListener().subscribe(updatedUser => {
      this.user = updatedUser;
    });
  }

  getUserDetails(userId) {
    this.registerService.getUsers(userId).subscribe(user => {
      if(user) {
        this.user = user;
        this.registerService.getStatesByCountryId(user.country).subscribe(
          (states: any[]) => {
            this.states = states;
          }
        );
      }
    }, error => {
      console.log(error);
    });
  }

  getStateName(stateId: number): string {
    const state = this.states.find(s => s.id === stateId);
    return state ? state.name : '';
  }


  openProfileDialod() {
    if (this.userId) {
      this.getUserDetails(this.userId); 
      this.dialog.open(ProfileDialogComponent, {
        height: '600px',
        width: '600px',
        disableClose: true,
        data: this.user
      });
    }
  }

  changeProfilePhoto() {
    document.querySelector<HTMLInputElement>('#fileInput1').click();
  }

  uploadPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.registerService.openSnackBar('Please upload a valid image file','Close')
        return;
      }
  
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        img.src = e.target.result;
  
        img.onload = () => {
          if (img.width > 310 || img.height > 325) {
            this.registerService.openSnackBar('The image dimensions exceed the allowed limits. Please upload an image with a width of 310 pixels or less and a height of 325 pixels or less.', 'Close');
          } else {
            this.user.photo = this.sanitizeImage(e.target.result,file.type);
            this.registerService.updateUserPhoto(this.user, this.user.id).subscribe(
              response => {
                if (response) {
                  this.getUserDetails(this.user.id);
                  this.registerService.notifyUserUpdated(this.user);
                  this.registerService.openSnackBar('Profile photo updated successfully', 'Close');
                }
              },
              error => console.log('Error updating photo', error)
            );
          }
        };
      };
  
      reader.readAsDataURL(file);
    }
  }

  sanitizeImage(image: string, fileType: string): SafeUrl {
    if (fileType === 'image/svg+xml') {
      return this.sanitizer.bypassSecurityTrustUrl(image);
    }
    return image;
  }

  agreeBtn() {
    this.registerService.openSnackBar('Agreement accepted successfully', 'Close');
  }

  ngOnDestroy() {
    this.userUpdatedSub.unsubscribe();
  }
}
