import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Project } from '../../model/project.entity';
import { NgForm } from '@angular/forms';
import {NgxEditorModule, Editor, Toolbar} from "ngx-editor";
import { CustomizerSettingsService } from '../../../shared/services/customizer-settings.service';
import {ProjectsApiService} from "../../services/projects-api.service";
import {CreateProject} from "../../model/create-project";
import {Router} from "@angular/router";

@Component({
  selector: 'app-project-create-and-edit',
  templateUrl: './project-create-and-edit.component.html',
  styleUrl: './project-create-and-edit.component.scss'
})
export class ProjectCreateAndEditComponent {
  @Input() project: Project;
  @Input() editMode = false;
  @Output() projectAdded = new EventEmitter<Project>();
  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() editCanceled = new EventEmitter();
  @ViewChild('projectForm', {static:false}) projectForm!: NgForm;
  projectName: string = '';
  sellAgents: string = '';
  buyAgents: string = '';

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

  constructor(public themeService: CustomizerSettingsService,
              private projectsApiService: ProjectsApiService,
              private router: Router) {
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
    if (this.projectForm.form.valid) {
      let createProject = new CreateProject(this.projectName, this.usableSellAgentsInput(), this.usableBuyAgentsInput());
      this.projectsApiService.create(createProject).subscribe({
        next: (response) => {
          // Navigate to the desired route after successful creation
          this.router.navigate(['/project-management/all-projects']);
        },
        error: (error) => {
          // Handle error
          console.error('Error creating project', error);
        }
      });
    }
  }

  private usableSellAgentsInput() {
    return this.sellAgents.replace(' ','').split(',');
  }
  private usableBuyAgentsInput() {
    return this.buyAgents.replace(' ','').split(',');
  }

  onCancel() {
    this.router.navigate(['/project-management/all-projects']);
  }

  // RTL Mode
  toggleRTLEnabledTheme() {
    this.themeService.toggleRTLEnabledTheme();
  }
}
