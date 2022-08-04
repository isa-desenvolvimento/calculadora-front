import { Component, OnInit, Output,EventEmitter, Input } from "@angular/core";
import { UserService } from "../../../_services/user.service";
import { User } from "../../../_models/user";

declare interface TableData {
  headerRow: string[];
  dataRows: Object[];
}

@Component({
  selector: "table-cmp",
  moduleId: module.id,
  templateUrl: "table.component.html",
})
export class TableComponent implements OnInit {
  @Output() updateUser: EventEmitter<any> = new EventEmitter();
  @Output() deleteUser: EventEmitter<any> = new EventEmitter();

  constructor(private userService: UserService) {}

  public myModel: any;
  public tableData: TableData;
  public errorMessage: string;
  public tableLoading = false;

  ngOnInit() {
    this.buildDataTable();
  }

  buildDataTable() {
    this.tableLoading = true;
    setTimeout(() => {
      this.userService.getAll().subscribe(
        (userList) => {
          this.tableData = {
            // headerRow: ["Data de criação", "Nome", "Perfil", "Status", ""],
            headerRow: ["Data de criação", "Nome", "Perfil", "Status"],
            dataRows: userList.reverse(),
          };
          setTimeout(() => {
            this.tableLoading = false;
          }, 1000);
        },
        (err) => {
          this.errorMessage = err.error.message;
          setTimeout(() => {
            this.tableLoading = false;
          }, 100);
        }
      );
    }, 100);
  }

  formatDate(createdDate: Date) {
    const timestamp = Date.parse(createdDate.toString());
    const date = new Date(timestamp).toJSON();
    const formatedDate = date
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/")
      .concat(" ")
      .concat(date.slice(11, 16));

    return formatedDate;
  }


  updateName(event: any, payload: User) {
    const localUsername = event.target.innerText;

    // Verify changes
    if (payload.username === localUsername) {
      return false;
    }

    const localPayload = { ...payload };
    localPayload.username = localUsername;

    this.updateUser.emit(localPayload);

    this.buildDataTable();
  }

  updateSelect(event: any, payload: User, attr: string, ref: string) {
    const localPayload = { ...payload };
    localPayload[attr] = event.target[ref];
    localPayload.status = localPayload.status === "true";

    this.updateUser.emit(localPayload);
    this.buildDataTable();
  }

  delete(payload: User) {
    this.deleteUser.emit(payload.id)

    this.buildDataTable();
  }
}
