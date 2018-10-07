import { Component, OnInit } from '@angular/core';

interface NotificationMessage {
	type: string;
  message: string;
  persist: boolean;
  auto_destroy: boolean;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  public notifications: NotificationMessage[] = [];

  constructor() {}

  ngOnInit() {}


  notify(
    type: string,
    message: string,
    persist: boolean = false,
    auto_destroyed: boolean = true
  ): void {

    console.log('notifying...');

    const notification: NotificationMessage = {
			type: type,
      message: message,
      persist: persist,
      auto_destroy: auto_destroyed
		};


    // Don't pile up duplicate notifcations, but renew the time index of auto close
    for (var i = 0; i < this.notifications.length; i++) {
      if (this.notifications[i].hasOwnProperty('message')) {
        if (this.notifications[i].message == notification.message) {
          this.clear(i);
        }
      }
    }

    this.notifications.push(notification);
    window.scrollTo(0, 0);

    // Destructor
		if (auto_destroyed) {
      // Retire notification after 5 secs
			setTimeout(() => {
				this.clear(-1);
			}, 5000);
		}
  }


  clear(index: number): void {
    if (index === -1) {
      // clear all auto-destroy notifications
      this.notifications.forEach((notification: NotificationMessage, i: number) => {
        if (notification.auto_destroy) {
          this.notifications.splice(i, 1);
        }
      });
    } else {
      // otherwise remove specific message
      this.notifications.splice(index, 1);
    }
  }


  clearAll(): void {
    this.notifications.forEach((notification: NotificationMessage, i: number) => {
      // Clear all non-persistent notifications
      if (!this.notifications[i].persist) {
        this.notifications.splice(i, 1);
      }
    });
  }
}
