import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../_services/user.service";
import { User } from "../../../_models/user";

declare interface TableData {
  headerRow: string[];
  dataRows: Object[];
}

@Component({ templateUrl: "user.component.html" })
export class UserComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = "";
  payload: User;
  tableData: TableData;


  updateLoading = false;
  alertType = {
    mensagem: "",
    tipo: "",
  };

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      user_name: ["", Validators.required],
      user_password: ["", Validators.required],
      status: ["", Validators.required],
      profile: ["", Validators.required],
    });

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.userForm.controls;
  }

  resetFields() {
    this.userForm.reset();
  }

  addUser(table) {
    // stop here if form is invalid
    if (this.userForm.invalid) {
      return;
    }


    this.loading = true;

    this.payload = {
      username: this.f.user_name.value,
      password: this.f.user_password.value,
      status: this.f.status.value,
      profile: this.f.profile.value,
      createdDate: new Date(),
    };

    this.userService.addUser(this.payload).subscribe(
      (data) => {
        this.alertType = {
          mensagem: "Registro incluido!",
          tipo: "success",
        };

       
        this.resetFields();
    table.buildDataTable()

        this.toggleUpdateLoading();

      },
      (err) => {
        this.alertType = {
          mensagem: err.error.message,
          tipo: "danger",
        };
      }
    );
  }

  updateUser(payload) {
    this.userService.updateUser(payload).subscribe(
      () => {
        this.alertType = {
          mensagem: "Registro atualizado!",
          tipo: "success",
        };
        this.toggleUpdateLoading();

      },
      (err) => {
        this.alertType = {
          mensagem: err.error.message,
          tipo: "danger",
        };
        this.toggleUpdateLoading();

      }
    );
  }

  
  deleteUser(payload) {
    this.userService.removeUser(payload).subscribe(
      () => {
        this.alertType = {
          mensagem: "Registro excluido!",
          tipo: "danger",
        };
        this.toggleUpdateLoading();

      },
      (err) => {
        this.alertType = {
          mensagem: err.error.message,
          tipo: "danger",
        };
        this.toggleUpdateLoading();

      }
    );
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 5000);
  }
}
