import { TestBed, inject } from '@angular/core/testing';

import { GlobalNotificationsService } from './global-notifications.service';

describe('GlobalNotificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalNotificationsService]
    });
  });

  it('should be created', inject([GlobalNotificationsService], (service: GlobalNotificationsService) => {
    expect(service).toBeTruthy();
  }));
});
