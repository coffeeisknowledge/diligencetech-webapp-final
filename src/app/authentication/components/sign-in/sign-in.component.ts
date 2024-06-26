import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomizerSettingsService } from '../../../shared/services/customizer-settings.service';
import { AuthUsers } from '../../model/auth-users.entity';
import { AuthService } from '../../services/auth.service';
import {AuthenticationService} from "../../services/authentication.service";
import {SignInRequest} from "../../model/sign-in.request";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit{
    isToggled = true;
    userData: AuthUsers;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        public themeService: CustomizerSettingsService,
        private authenticationService: AuthenticationService
    ) {
        this.userData = new AuthUsers();
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
        });
    }

    ngOnInit(): void {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    onLogin() {
      const email= this.authForm.get("email")!.value;
      const password= this.authForm.get("password")!.value;
      this.authService.login(email,password).subscribe(data => {
        if(data) {
          this.router.navigate(["/dashboard"]);
        }else{
          console.log("User not found");
        }
      });
    }

    // Password Hide
    hide = true;

    // Form
    authForm: FormGroup;
    onSubmit() {
      if (this.authForm.valid) {
        const email = this.authForm.get("email")!.value;
        const password = this.authForm.get("password")!.value;
        // class version
        const signInRequest = new SignInRequest(email, password);
        this.authenticationService.signIn(signInRequest);
        // my version
        /*
        this.authService.login(email, password).subscribe((data:any) => {
          this.userData = data[0];
          if(this.userData && this.userData.email == email && this.userData.password == password){
            console.log("user found");
            localStorage.setItem('user', this.userData.id);
            //localStorage.setItem('token', "active");
            this.router.navigate(["/dashboard"]);
          } else {
            console.log("user not found");
          }
        }, (error:any) => {
            console.error('Error during login:', error);
        });
         */
      } else {
          console.log('Form is invalid. Please check the fields.');
      }

    }

    // Dark Mode
    toggleTheme() {
        this.themeService.toggleTheme();
    }

    // Card Border
    toggleCardBorderTheme() {
        this.themeService.toggleCardBorderTheme();
    }

    // RTL Mode
    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

}
