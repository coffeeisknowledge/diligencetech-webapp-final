import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Project} from "../../../project-management/model/project.entity";
import {NgForm} from "@angular/forms";
import {Editor, Toolbar} from "ngx-editor";
import {CustomizerSettingsService} from "../../../shared/services/customizer-settings.service";
import {AreaApiService} from "../../services/area-api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AreaRequest} from "../../model/area.request";

@Component({
  selector: 'app-area-creation',
  templateUrl: './area-creation.component.html',
  styleUrl: './area-creation.component.scss'
})
export class AreaCreationComponent {
  @Input() project: Project;
  @Input() editMode = false;
  @Output() projectAdded = new EventEmitter<Project>();
  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() editCanceled = new EventEmitter();
  @ViewChild('projectForm', {static:false}) projectForm!: NgForm;
  areaName: string = '';

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ]

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  public multiple: boolean = false;

  isToggled = false;

  constructor(
    public themeService: CustomizerSettingsService,
    private areaApiService: AreaApiService,
    private route: ActivatedRoute,
    private router: Router
      ) {
    this.project = {} as Project;
    this.themeService.isToggled$.subscribe(_isToggled => {
      this.isToggled = _isToggled;
    })
  }

  private resetEditState(){
    this.editMode = false;
    this.projectForm.resetForm();
    this.project = {} as Project;
  }

  onSubmit() {
    this.route.params.subscribe(params => {
      let createArea = new AreaRequest(params['id'], this.areaName);
      this.areaApiService.create(createArea).subscribe({
        next: (response) => {
          console.log(`Area Created: ${response.fileName}`);
          this.router.navigate([`/project-management/all-projects/${params['id']}/file-management`]);
        },
        error: (error) => {
          console.error(`Error while creating area: ${error.message}`);
        }
      });
    })
  }

  onCancel() {
    this.resetEditState();
    this.editCanceled.emit();
  }

  // RTL Mode
  toggleRTLEnabledTheme() {
    this.themeService.toggleRTLEnabledTheme();
  }
}
