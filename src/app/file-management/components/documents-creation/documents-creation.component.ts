import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Project} from "../../../project-management/model/project.entity";
import {NgForm} from "@angular/forms";
import {Editor, Toolbar} from "ngx-editor";
import {CustomizerSettingsService} from "../../../shared/services/customizer-settings.service";
import {AreaApiService} from "../../services/area-api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AreaRequest} from "../../model/area.request";
import {DocumentsApiService} from "../../services/documents-api.service";
import {finalize} from "rxjs/operators";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {lastValueFrom} from "rxjs";
import {DocumentRequest} from "../../model/document.request";

@Component({
  selector: 'app-documents-creation',
  templateUrl: './documents-creation.component.html',
  styleUrl: './documents-creation.component.scss'
})
export class DocumentsCreationComponent {
  @Input() project: Project;
  @Input() editMode = false;
  @Output() projectAdded = new EventEmitter<Project>();
  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() editCanceled = new EventEmitter();
  @ViewChild('projectForm', {static:false}) projectForm!: NgForm;
  areaName: string = '';
  files: File[] = [];
  uploadProgress: number | undefined;
  mustDisable: boolean = false;

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
    private documentsApiService: DocumentsApiService,
    private route: ActivatedRoute,
    private router: Router,
    private storage: AngularFireStorage
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.files.push(input.files[i]);
      }
    }
  }
  removeFile(file: File): void {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  uploadFiles(): void {
    this.mustDisable = true;
    this.route.params.subscribe(params => {
        const tasks = this.files.map(file => {
        const filePath = `${params['id']}/${params['areaId']}/${params['folderId']}/${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        task.percentageChanges().subscribe(progress => {
          this.uploadProgress = progress;
        });

        return task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              console.log('File URL:', url);
              this.route.params.subscribe(params => {
                console.log(params['folderId'], file.name, url)
                let documentRequest: DocumentRequest = new DocumentRequest(params['folderId'], file.name, url);
                this.documentsApiService.create(documentRequest).subscribe({
                  next: (response) => {
                    console.log(`Document Created: ${response.filename}`);
                  },
                  error: (error) => {
                    console.error(`Error while creating document: ${error.message}`);
                  }
                });
              })
            });
          })
        );
      });

      Promise.all(tasks.map(task => lastValueFrom(task))).then(() => {
        this.files = []; // Clear the files array after all uploads are completed
        this.mustDisable = false;
      });
    });
  }


  goBack() {
    this.route.params.subscribe(params => {
      this.router.navigate([`/project-management/all-projects/${params['id']}/file-management/${params['areaId']}/${params['folderId']}`]);
    });
  }

  onSubmit() {
    this.route.params.subscribe(params => {
      let createArea = new AreaRequest(params['id'], this.areaName);
      this.documentsApiService.create(createArea).subscribe({
        next: (response) => {
          console.log(`Area Created: ${response.filename}`);
          this.router.navigate([`/${params['id']}/file-management`]);
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
