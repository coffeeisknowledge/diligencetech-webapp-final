import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Notifications } from '../../model/notifications.entity';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { NotificationApiService } from '../../services/notification-api.service';
import { CustomizerSettingsService } from '../../../shared/services/customizer-settings.service';
import {ActivatedRoute} from "@angular/router";
import {response} from "express";

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'

})
export class NotificationListComponent implements OnInit, AfterViewInit {
  notificationsData: Notifications;
  dataSource!: MatTableDataSource<any>;
  displayedColumns: any[] = ['id', 'created_at', 'type', 'content'];
  @ViewChild(MatPaginator, {static: false})paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false})sort!: MatSort;
  isEditMode: boolean;

  isToggled = false;

  constructor(
    private notificationsApiService: NotificationApiService,
    public themeService: CustomizerSettingsService,
    private route: ActivatedRoute
  ){
    this.themeService.isToggled$.subscribe(isToggled => {
      this.isToggled = isToggled;
    });
    this.isEditMode = false
    this.notificationsData = {} as Notifications;
    this.dataSource = new MatTableDataSource<any>();

  }
  // Private


  // UI Event Handlers



  ngOnInit(): void {
    this.route.params.subscribe(params =>{

      this.getNotificationsByAgentId(params['agentId']);
      //console.log(this.getNotificationsByAgentId(params['agentId']));
    })
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private getAllNotifications() {
    this.notificationsApiService.getAll().subscribe((response: any) => {
      this.dataSource.data = response;
    });
  };

  getNotificationsByAgentId(agent_id: number){
    this.notificationsApiService.getByAgentId(agent_id).subscribe((response: any) => {
      console.log(response.length);
      this.dataSource.data = response;
      console.log(response);
    });
  }


}
